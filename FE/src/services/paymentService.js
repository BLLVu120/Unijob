import { apiRequest } from '../api/api';
import { getCurrentUser } from './authService';
import { jobService } from './jobService';

/*
 * Thanh toán qua VNPay (Sandbox):
 *   1. BE tạo URL thanh toán VNPay đã ký → FE ghi giao dịch "pending" vào bảng transactions
 *   2. Người dùng thanh toán trên trang VNPay
 *   3. VNPay chuyển về /payment/result?vnp_...  → FE gửi các tham số cho BE kiểm tra chữ ký
 *      (/v1/payment/verify_return), rồi cập nhật giao dịch và áp dụng kết quả
 *      (gia hạn tin / kích hoạt gói).
 *
 * provider_id lưu dạng "vnpay|<mã giao dịch>|<loại>|<tham chiếu>" để biết giao dịch mua gì
 * (giao dịch cũ dạng "payos|..." vẫn đọc được).
 *
 * Lưu ý: chưa có IPN (VNPay gọi thẳng về server) vì cần URL public; khi lên production nên bổ sung.
 */

const enc = encodeURIComponent;
const PENDING_KEY = 'pendingPayment';

// Các gói dịch vụ cho nhà tuyển dụng (giá VNĐ, thời hạn theo ngày)
export const PLANS = {
  basic: { name: 'Gói Basic', price: 500000, days: 30, durationLabel: '1 tháng', posts: 5, visibilityDays: 15 },
  professional: { name: 'Gói Professional', price: 2000000, days: 90, durationLabel: '3 tháng', posts: 20, visibilityDays: 30 },
  enterprise: { name: 'Gói Enterprise', price: 5000000, days: 30, durationLabel: '1 tháng', posts: 50, visibilityDays: 45 }
};

export const RENEW_JOB = { price: 50000, days: 15 };

export const parseProvider = (providerId) => {
  const [provider, orderCode, kind, ref] = (providerId || '').split('|');
  return { provider, orderCode, kind, ref };
};

export const describeTransaction = (tx) => {
  const { kind, ref } = parseProvider(tx.provider_id);
  if (kind === 'plan') return PLANS[ref]?.name || `Gói ${ref}`;
  if (kind === 'renew') return 'Làm mới tin tuyển dụng';
  return 'Thanh toán dịch vụ';
};

export const getTransactions = async (userId) => {
  const res = await apiRequest(`/v1/transaction/get_transaction_by_id?id=${enc(userId)}`);
  return (res.transactions || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

const updateTransaction = (transactionId, status) =>
  apiRequest('/v1/transaction/update', {
    method: 'POST',
    body: JSON.stringify({ transaction_id: transactionId, status })
  });

/*
 * Gói đang dùng, suy ra từ các giao dịch mua gói thành công.
 * Gia hạn khi còn hạn thì kỳ mới nối tiếp ngay sau ngày hết hạn cũ.
 */
export const getActivePlan = async (userId) => {
  const txs = (await getTransactions(userId))
    .filter(tx => tx.status === 'completed' && parseProvider(tx.provider_id).kind === 'plan')
    .sort((a, b) => new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at));

  let current = null;
  for (const tx of txs) {
    const { ref } = parseProvider(tx.provider_id);
    const plan = PLANS[ref];
    if (!plan) continue;
    const paidAt = new Date(tx.updated_at || tx.created_at);
    const continues = current && current.key === ref && current.expiresAt > paidAt;
    const start = continues ? current.startedAt : paidAt;
    const from = continues ? current.expiresAt : paidAt;
    current = { key: ref, ...plan, startedAt: start, expiresAt: new Date(from.getTime() + plan.days * 86400000) };
  }
  return current && current.expiresAt > new Date() ? current : null;
};

/**
 * Bắt đầu thanh toán và chuyển sang trang VNPay.
 * kind: "plan" | "renew";  ref: mã gói hoặc job_id
 */
export const startPayment = async ({ amount, description, kind, ref, returnTo }) => {
  const user = getCurrentUser();
  if (!user?.emp_id) throw new Error('Bạn cần đăng nhập bằng tài khoản nhà tuyển dụng');

  const resultUrl = `${window.location.origin}/payment/result`;
  const res = await apiRequest('/v1/payment/create_payment_link', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      description: description.slice(0, 255),
      return_url: resultUrl
    })
  });

  const transactionId = crypto.randomUUID();
  await apiRequest('/v1/transaction/add', {
    method: 'POST',
    body: JSON.stringify({
      transaction_id: transactionId,
      user_id: user.emp_id,
      amount,
      currency: 'VND',
      status: 'pending',
      provider_id: `vnpay|${res.orderCode}|${kind}|${ref}`
    })
  });

  localStorage.setItem(PENDING_KEY, JSON.stringify({
    transactionId, orderCode: String(res.orderCode), kind, ref, amount, returnTo
  }));
  window.location.href = res.checkoutUrl;
};

const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const applyEffect = async ({ kind, ref }) => {
  if (kind === 'renew') {
    const job = await jobService.getJobById(ref);
    if (!job) return;
    const today = new Date(new Date().toDateString());
    const from = job.expiry_date && new Date(job.expiry_date) > today ? job.expiry_date : today;
    await jobService.updateJob({ job_id: ref, expiry_date: addDays(from, RENEW_JOB.days), is_active: true });
  }
  // kind === "plan": gói được suy ra từ giao dịch thành công, không cần làm gì thêm
};

/**
 * Xử lý khi VNPay chuyển về. params: URLSearchParams của trang kết quả.
 * BE kiểm tra chữ ký trước khi coi là thanh toán thành công.
 * Trả về { status: "success" | "cancelled" | "unknown", payment }
 */
export const completePayment = async (params) => {
  let pending = null;
  try { pending = JSON.parse(localStorage.getItem(PENDING_KEY)); } catch { pending = null; }

  const orderCode = params.get('vnp_TxnRef');
  if (!pending || !orderCode || orderCode !== pending.orderCode) {
    return { status: 'unknown', payment: pending };
  }

  const check = await apiRequest('/v1/payment/verify_return', {
    method: 'POST',
    body: JSON.stringify({ query: Object.fromEntries(params.entries()) })
  });
  if (!check.valid) throw new Error('Chữ ký thanh toán không hợp lệ. Giao dịch chưa được ghi nhận.');

  const paid = check.paid;
  await updateTransaction(pending.transactionId, paid ? 'completed' : 'failed');
  if (paid) await applyEffect(pending);
  localStorage.removeItem(PENDING_KEY);

  return {
    status: paid ? 'success' : 'cancelled',
    payment: pending,
    detail: { bankCode: check.bankCode, transactionNo: check.transactionNo, responseCode: check.responseCode, paidAt: new Date().toISOString() }
  };
};
