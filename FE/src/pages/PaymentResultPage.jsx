import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check, X, Loader2, SearchX, ArrowRight, Receipt, Hash, Package, CreditCard, Landmark, Clock, RotateCcw
} from 'lucide-react';
import { COLORS, SHADOW, GRADIENT } from '../constants/colors';
import { completePayment, PLANS, RENEW_JOB } from '../services/paymentService';
import { formatNumber } from '../utils/textUtils';

const C = COLORS;

// Giao diện theo từng kết quả
const CONTENT = {
  loading: {
    icon: Loader2, spin: true, gradient: GRADIENT.hero,
    tint: C.blueLight, color: C.purple,
    title: 'Đang xác nhận thanh toán', text: 'Vui lòng không đóng trang trong giây lát...'
  },
  success: {
    icon: Check, gradient: 'linear-gradient(135deg, #047857 0%, #10b981 55%, #34d399 100%)',
    tint: C.greenBg, color: C.green,
    title: 'Thanh toán thành công', text: 'Giao dịch đã được VNPay xác nhận và ghi nhận vào tài khoản của bạn.'
  },
  cancelled: {
    icon: X, gradient: GRADIENT.dangerDeep,
    tint: C.redBg, color: C.red,
    title: 'Thanh toán chưa hoàn tất', text: 'Giao dịch đã bị hủy hoặc không thành công. Bạn chưa bị trừ tiền.'
  },
  unknown: {
    icon: SearchX, gradient: 'linear-gradient(135deg, #475569 0%, #64748b 55%, #94a3b8 100%)',
    tint: C.grayBg, color: C.gray,
    title: 'Không tìm thấy giao dịch', text: 'Không có giao dịch nào đang chờ xác nhận trên trình duyệt này.'
  },
  error: {
    icon: X, gradient: GRADIENT.dangerDeep,
    tint: C.redBg, color: C.red,
    title: 'Có lỗi xảy ra', text: ''
  }
};

const BADGE = {
  success: 'Thành công', cancelled: 'Thất bại', unknown: 'Không xác định', error: 'Lỗi', loading: 'Đang xử lý'
};

const describe = (payment) => {
  if (!payment) return '—';
  if (payment.kind === 'plan') return PLANS[payment.ref]?.name || 'Gói dịch vụ';
  if (payment.kind === 'renew') return `Làm mới tin tuyển dụng (+${RENEW_JOB.days} ngày)`;
  return 'Thanh toán dịch vụ';
};

const fmtTime = (iso) => new Date(iso).toLocaleString('vi-VN', {
  hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
});

// Trang VNPay chuyển về sau khi thanh toán (vnp_ReturnUrl)
export default function PaymentResultPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [state, setState] = useState({ status: 'loading', payment: null, detail: null, error: '' });
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    completePayment(params)
      .then(res => setState({ detail: null, ...res, error: '' }))
      .catch(err => setState({ status: 'error', payment: null, detail: null, error: err.message }));
  }, [params]);

  const { status, payment, detail } = state;
  const content = CONTENT[status];
  const Icon = content.icon;
  const backTo = payment?.returnTo || '/employer/transactions';
  const done = status !== 'loading';

  const rows = payment ? [
    { icon: Package, label: 'Dịch vụ', value: describe(payment) },
    { icon: Hash, label: 'Mã giao dịch', value: payment.orderCode ? `#${payment.orderCode}` : '—' },
    { icon: CreditCard, label: 'Phương thức', value: 'VNPay' },
    detail?.bankCode && { icon: Landmark, label: 'Ngân hàng', value: detail.bankCode },
    detail?.transactionNo && detail.transactionNo !== '0' && { icon: Receipt, label: 'Mã GD VNPay', value: detail.transactionNo },
    detail?.paidAt && { icon: Clock, label: 'Thời gian', value: fmtTime(detail.paidAt) }
  ].filter(Boolean) : [];

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      minHeight: '80vh', background: C.grayBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px'
    }}>
      <div style={{
        maxWidth: 520, width: '100%', background: C.white, borderRadius: 24,
        boxShadow: SHADOW.lg, overflow: 'hidden', animation: 'slideDown .3s ease'
      }}>
        {/* Dải màu theo kết quả + icon lớn */}
        <div style={{
          background: content.gradient, padding: '36px 32px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -140, right: -60 }} />
          <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -90, left: -40 }} />
          <span style={{
            position: 'relative', display: 'inline-block', padding: '5px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
            color: C.white, fontSize: 12, fontWeight: 600, letterSpacing: '.02em'
          }}>
            {BADGE[status]}
          </span>
          <h2 style={{ position: 'relative', fontSize: 26, fontWeight: 800, color: C.white, margin: '14px 0 6px', letterSpacing: '-0.02em' }}>
            {content.title}
          </h2>
          <p style={{ position: 'relative', fontSize: 14, color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>
            {status === 'error' ? state.error : content.text}
          </p>
        </div>

        {/* Icon nổi giữa dải màu và nội dung */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -44, position: 'relative' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', background: C.white, padding: 8, boxShadow: SHADOW.md
          }}>
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', background: content.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon
                size={36} color={C.white} strokeWidth={3}
                style={content.spin ? { animation: 'spin 1s linear infinite' } : undefined}
              />
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 32px 32px' }}>
          {payment?.amount && done && (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: C.gray, marginBottom: 4 }}>
                {status === 'success' ? 'Số tiền đã thanh toán' : 'Số tiền giao dịch'}
              </p>
              <p style={{ fontSize: 34, fontWeight: 800, color: status === 'success' ? C.navy : C.gray, letterSpacing: '-0.02em' }}>
                {formatNumber(payment.amount)}<span style={{ fontSize: 20, marginLeft: 2 }}>đ</span>
              </p>
            </div>
          )}

          {rows.length > 0 && done && (
            <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 24 }}>
              {rows.map(({ icon, label, value }, i) => {
                const RowIcon = icon;
                return (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderTop: i ? `1px solid ${C.border}` : 'none', background: i % 2 ? C.white : COLORS.grayCard
                  }}>
                    <span style={{
                      width: 30, height: 30, borderRadius: 9, background: content.tint, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <RowIcon size={15} color={content.color} />
                    </span>
                    <span style={{ fontSize: 13, color: C.gray, flex: 1 }}>{label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, textAlign: 'right' }}>{value}</span>
                  </div>
                );
              })}
            </div>
          )}

          {done && (
            <div style={{ display: 'flex', gap: 10 }}>
              {status !== 'success' && payment?.returnTo && (
                <button
                  onClick={() => navigate(payment.returnTo)}
                  style={{
                    flex: 1, height: 48, borderRadius: 14, border: `1px solid ${C.border}`, background: C.white,
                    color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  <RotateCcw size={17} /> Thử lại
                </button>
              )}
              {status === 'success' && (
                <button
                  onClick={() => navigate('/employer/transactions')}
                  style={{
                    flex: 1, height: 48, borderRadius: 14, border: `1px solid ${C.border}`, background: C.white,
                    color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  <Receipt size={17} /> Lịch sử giao dịch
                </button>
              )}
              <button
                onClick={() => navigate(backTo)}
                style={{
                  flex: 1, height: 48, borderRadius: 14, border: 'none',
                  background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleGradient} 100%)`,
                  color: C.white, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: SHADOW.primary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                Tiếp tục <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
