import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Eye, Edit, Trash2, Plus, RefreshCw, X, MapPin, Briefcase, GraduationCap, Clock, CheckCircle, XCircle, AlertCircle, Calendar, TrendingUp, PauseCircle, Hourglass, QrCode, FileText, ListChecks, Gift, Info, Wallet, Check, Users, Layers
} from 'lucide-react';
import { flex, txt, card, field } from '../../utils/styles';
import { COLORS, TILE_GRADIENTS, GRADIENT } from '../../constants/colors';
import { PAGE_BTN_STYLE } from '../../constants/pageBtnStyle';
import { getCurrentUser } from '../../services/authService';
import { jobService } from '../../services/jobService';
import { startPayment, RENEW_JOB } from '../../services/paymentService';
import { formatSalary, formatExperience, JOB_TYPE_LABELS, normalize } from '../../utils/jobFormat';
import PageHeader from '../../components/PageHeader';
import { InfoTile } from '../../components/ProfileKit';
import Toast from '../../components/Toast';
import { formatDate, formatNumber } from '../../utils/textUtils';
import Select from '../../components/Select';
const C = COLORS;

// Checkbox trong bảng: to hơn, màu tím, căn giữa theo dòng
const CHECKBOX = { width: 18, height: 18, margin: 0, display: 'block', cursor: 'pointer', accentColor: C.purple };

// Thẻ bọc từng phần (hộp thoại xem tin)
const SECTION_CARD = {
  background: C.white, border: `1px solid ${C.border}`, borderRadius: 16,
  padding: '20px 22px', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)'
};

// Các mục trong form đăng / sửa tin: nền trắng + viền đậm để tách rõ từng mục
const FORM_SECTION = {
  background: C.white, border: '1.5px solid #cbd2df', borderRadius: 16, padding: '20px 22px'
};

/* ─── Trạng thái tin ──────────────────────────────────────────────
 * BE chỉ có is_active + expiry_date (chưa có bước kiểm duyệt), nên:
 *   hết hạn  = expiry_date < hôm nay
 *   tạm dừng = is_active = false
 *   đang hoạt động = còn lại
 */
const STATUS_STYLE = {
  active: { bg: C.greenBg, text: C.green, label: 'Đang hoạt động', icon: CheckCircle },
  pending: { bg: C.blueLight, text: C.blue, label: 'Chờ duyệt', icon: Clock },
  paused: { bg: C.yellowBg, text: C.amber, label: 'Tạm dừng', icon: PauseCircle },
  expired: { bg: C.grayBg, text: C.gray, label: 'Hết hạn', icon: Clock },
  rejected: { bg: C.redBg, text: C.red, label: 'Từ chối duyệt', icon: XCircle }
};

const todayStart = () => new Date(new Date().toDateString());

const jobStatus = (job) => {
  if (job.expiry_date && new Date(job.expiry_date) < todayStart()) return 'expired';
  return job.is_active === false ? 'paused' : 'active';
};

const toRow = (job) => {
  const status = jobStatus(job);
  const style = STATUS_STYLE[status];
  return {
    ...job,
    id: job.job_id,
    status,
    detailedStatus: status,
    statusLabel: style.label,
    statusColor: style.bg,
    statusText: style.text,
    createdDate: formatDate(job.created_at),
    createdIso: job.created_at ? String(job.created_at).slice(0, 10) : '',
    expiryDate: job.expiry_date ? formatDate(job.expiry_date) : 'Không thời hạn',
    salary: formatSalary(job.salary_min, job.salary_max),
    experienceText: formatExperience(job.experience),
    enabled: job.is_active !== false,
    canToggle: status !== 'expired',
    showRenew: status === 'expired'
  };
};

const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

/* ─── Làm mới tin (thanh toán) ───────────────────────────────── */

const RenewJobModal = ({ open, onClose, job }) => {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  if (!open || !job) return null;

  const from = job.expiry_date && new Date(job.expiry_date) > todayStart() ? job.expiry_date : todayStart();
  const newExpiry = addDays(from, RENEW_JOB.days);

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      await startPayment({
        amount: RENEW_JOB.price,
        description: 'Unijob lam moi tin',
        kind: 'renew',
        ref: job.job_id,
        returnTo: '/employer/jobs'
      });
    } catch (err) {
      setError(err.message);
      setPaying(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: '100%', maxWidth: 520,
        background: C.white, borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          ...flex('center'), justifyContent: 'space-between',
          padding: '24px 28px', borderBottom: `1px solid ${C.border}`
        }}>
          <div>
            <h2 style={{ ...txt(22, 700), marginBottom: 5 }}>Làm mới tin tuyển dụng</h2>
            <p style={{ ...txt(14, 400, C.gray) }}>{job.title}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4
          }}>
            <X size={24} color={C.gray} />
          </button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <div style={{
            background: C.grayBg, borderRadius: 12, padding: '16px 20px', marginBottom: 24
          }}>
            <h3 style={{ ...txt(14, 700, C.gray), textTransform: 'uppercase', marginBottom: 12 }}>
              CHI TIẾT THANH TOÁN
            </h3>
            <div style={{ ...flex('center'), justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...txt(14, 400, C.gray) }}>Thời hạn mở rộng</span>
              <span style={{ ...txt(14, 600) }}>+{RENEW_JOB.days} ngày</span>
            </div>
            <div style={{ ...flex('center'), justifyContent: 'space-between' }}>
              <span style={{ ...txt(14, 400, C.gray) }}>Ngày hết hạn mới</span>
              <span style={{ ...txt(14, 600) }}>{newExpiry.toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${C.purple}, ${C.purpleLight})`,
            borderRadius: 12, padding: '16px 20px', marginBottom: 24,
            ...flex('center'), justifyContent: 'space-between'
          }}>
            <span style={{ ...txt(16, 600, C.white) }}>Tổng thanh toán</span>
            <span style={{ ...txt(24, 700, C.white) }}>{formatNumber(RENEW_JOB.price)}đ</span>
          </div>

          <div style={{ background: C.grayCard, borderRadius: 12, padding: 20 }}>
            <h3 style={{ ...txt(18, 700), marginBottom: 16 }}>Phương thức thanh toán</h3>
            <div style={{
              ...flex('center'), gap: 12, padding: '14px 16px',
              border: `2px solid ${C.purple}`, borderRadius: 10, background: C.white
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: 10, background: C.blueLight, flexShrink: 0,
                ...flex('center'), justifyContent: 'center'
              }}>
                <QrCode size={18} color={C.purple} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ ...txt(14, 600) }}>VNPay</p>
                <p style={{ ...txt(12, 400, C.gray) }}>Thẻ ATM / QR / ví điện tử · Môi trường thử nghiệm (Sandbox)</p>
              </div>
              {/* Đã chọn: hình tròn xanh dương + dấu check trắng */}
              <span style={{
                width: 20, height: 20, borderRadius: '50%', background: C.info, flexShrink: 0,
                ...flex('center'), justifyContent: 'center', boxShadow: '0 0 0 3px #dbeafe'
              }}>
                <Check size={12} color={C.white} strokeWidth={3} />
              </span>
            </div>
          </div>
          {error && (
            <div role="alert" style={{
              ...flex('flex-start'), gap: 10, padding: '12px 14px', borderRadius: 12, marginTop: 12,
              background: C.redBg, border: '1px solid #fbcaca', animation: 'slideDown .2s ease'
            }}>
              <AlertCircle size={18} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ ...txt(14, 500, C.red), lineHeight: 1.5 }}>{error}</span>
            </div>
          )}
        </div>

        <div style={{
          padding: '20px 28px', borderTop: `1px solid ${C.border}`,
          ...flex('center'), justifyContent: 'flex-end', gap: 12
        }}>
          <button onClick={onClose} style={{
            padding: '12px 28px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.white,
            color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            Hủy
          </button>
          <button
          onClick={handlePay}
          disabled={paying}
          style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: C.blue, color: C.white,
            fontSize: 15, fontWeight: 600,
            cursor: paying ? 'wait' : 'pointer', opacity: paying ? 0.7 : 1
          }}>
            {paying ? 'Đang chuyển đến VNPay...' : 'Xác nhận thanh toán'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Xem chi tiết tin ───────────────────────────────────────── */

const toLines = (text) => (text || '').split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

const ViewJobModal = ({ open, onClose, job }) => {
  if (!open || !job) return null;

  const config = STATUS_STYLE[job.detailedStatus];
  const StatusIcon = config.icon;
  const sections = [
    { title: 'Mô tả công việc', icon: FileText, text: job.description },
    { title: 'Yêu cầu ứng viên', icon: ListChecks, text: job.requirements },
    { title: 'Thời gian làm việc', icon: Clock, text: job.working_shifts },
    { title: 'Quyền lợi', icon: Gift, text: job.benefits }
  ];

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        ...flex('center'), justifyContent: 'center', padding: 24, overflowY: 'auto'
      }}>
        <div style={{
          background: C.white, borderRadius: 20,
          width: '100%', maxWidth: 1100,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            background: GRADIENT.hero,
            borderRadius: '20px 20px 0 0', padding: '28px 32px', position: 'relative'
          }}>
            <button onClick={onClose} title="Đóng" style={{
              position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
              ...flex('center'), justifyContent: 'center'
            }}>
              <X size={20} color={C.white} />
            </button>

            {/* Tiêu đề + nhãn trạng thái ngay bên cạnh */}
            <div style={{ ...flex('center'), gap: 12, flexWrap: 'wrap', marginBottom: 8, paddingRight: 56 }}>
              <h2 style={{ ...txt(28, 700, C.white), lineHeight: 1.25 }}>{job.title}</h2>
              <span style={{
                // Cùng cỡ nhãn trạng thái phía ứng viên (vd "Sắp diễn ra", "Từ chối")
                padding: '3px 10px', borderRadius: 999, background: config.bg, color: config.text,
                fontSize: 12, fontWeight: 600, ...flex('center'), gap: 5, flexShrink: 0
              }}>
                <StatusIcon size={12} /> {config.label}
              </span>
            </div>
            {/* Ngày đăng / hết hạn bọc thẻ kính mờ */}
            <div style={{ ...flex('center'), gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Ngày đăng', value: job.createdDate },
                { label: 'Hết hạn', value: job.expiryDate }
              ].map(({ label, value }) => (
                <span key={label} style={{
                  ...flex('center'), gap: 6, padding: '5px 12px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)',
                  ...txt(13, 500, C.white)
                }}>
                  <Calendar size={14} color={C.white} />
                  {label}: <b style={{ fontWeight: 700 }}>{value}</b>
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
              {[
                { icon: MapPin, label: 'Địa điểm', value: job.location || '—' },
                { icon: Briefcase, label: 'Mức lương', value: job.salary },
                { icon: GraduationCap, label: 'Kinh nghiệm', value: job.experienceText }
              ].map((f, i) => (
                // Cùng kiểu ô thông tin trang hồ sơ (InfoTile), mỗi thẻ một màu
                <InfoTile key={f.label} {...f} gradient={[TILE_GRADIENTS[1], TILE_GRADIENTS[2], TILE_GRADIENTS[3]][i]} />
              ))}
            </div>
          </div>

          <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
            <div>
              {sections.map(({ title, icon, text }) => {
                const Icon = icon;
                const lines = toLines(text);
                return (
                  // Cùng kiểu trang chi tiết việc làm: tiêu đề có icon trong ô tím nhạt, thẻ trắng, chấm tím đầu dòng
                  <div key={title} style={{ marginBottom: 24 }}>
                    <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 10 }}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: C.blueLight, ...flex('center'), justifyContent: 'center' }}>
                        <Icon size={17} color={C.purple} />
                      </span>
                      {title}
                    </h3>
                    <div style={{ ...card(), padding: '18px 24px', borderLeft: `4px solid ${C.purple}` }}>
                      {lines.length === 0 ? (
                        <p style={{ ...txt(14, 400, C.gray) }}>Chưa cập nhật</p>
                      ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {lines.map((line, index) => (
                            <li key={index} style={{ ...flex('flex-start'), gap: 10 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple, flexShrink: 0, marginTop: 9 }} />
                              <span style={{ ...txt(15, 400, C.darkGray), lineHeight: 1.55 }}>{line}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <h3 style={{ ...txt(18, 700), marginBottom: 12, ...flex('center'), gap: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: C.blueLight, ...flex('center'), justifyContent: 'center' }}>
                  <Info size={17} color={C.purple} />
                </span>
                Thông tin chung
              </h3>
              <div style={{ ...SECTION_CARD, padding: '8px 24px' }}>
                {[
                  { icon: Users, label: 'Số lượng tuyển', value: job.num_slot ? `${job.num_slot} người` : '—' },
                  { icon: Calendar, label: 'Hạn nộp hồ sơ', value: job.expiryDate, color: C.red },
                  { icon: Layers, label: 'Hình thức', value: JOB_TYPE_LABELS[job.job_type] || '—' },
                  { icon: Briefcase, label: 'Cấp bậc', value: job.role || '—' },
                  { icon: GraduationCap, label: 'Học vấn', value: job.education_level || '—' }
                ].map(({ icon, label, value, color }, i, arr) => {
                  const Icon = icon;
                  return (
                    // Cùng kiểu "Thông tin chung" ở trang chi tiết việc làm: icon | nhãn | giá trị sát phải
                    <div key={label} style={{
                      ...flex('center'), gap: 12, padding: '12px 0',
                      borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${C.border}`
                    }}>
                      <Icon size={18} color={C.grayLight} style={{ flexShrink: 0 }} />
                      <span style={{ ...txt(14, 400, C.gray), flex: 1 }}>{label}</span>
                      <span style={{ ...txt(14, 600, color || C.navy), textAlign: 'right' }}>{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{
            padding: '20px 32px', borderTop: `1px solid ${C.border}`,
            ...flex('center'), justifyContent: 'flex-end'
          }}>
            <button onClick={onClose} style={{
              height: 42, padding: '0 28px', borderRadius: 12, border: 'none',
              background: C.purple, color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Form đăng / sửa tin ─────────────────────────────────────── */

const CITIES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Online'];
const EXPERIENCE_OPTIONS = [
  { value: 0, label: 'Không yêu cầu' },
  { value: 1, label: '1 năm' },
  { value: 2, label: '2 năm' },
  { value: 3, label: '3 năm trở lên' }
];
const EDUCATION_OPTIONS = ['Không yêu cầu', 'THPT', 'Trung cấp', 'Cao đẳng', 'Đại học'];
const ROLE_OPTIONS = ['Nhân viên', 'Thực tập sinh', 'Cộng tác viên', 'Trưởng nhóm'];

// Tách "Quận 3, TP. Hồ Chí Minh" → { district: "Quận 3", city: "TP. Hồ Chí Minh" }
const splitLocation = (location) => {
  const loc = location || '';
  const city = CITIES.find(c => loc.endsWith(c));
  if (!city) return { city: CITIES[0], district: loc };
  return { city, district: loc.slice(0, loc.length - city.length).replace(/,\s*$/, '').trim() };
};

const emptyForm = () => ({
  title: '', job_type: 'offline', experience: 0, city: CITIES[0], district: '',
  num_slot: '', salary_min: '', salary_max: '', expiry_date: '',
  education_level: EDUCATION_OPTIONS[0], role: ROLE_OPTIONS[0],
  description: '', requirements: '', working_shifts: '', benefits: ''
});

const formFromJob = (job) => {
  const { city, district } = splitLocation(job.location);
  return {
    title: job.title || '',
    job_type: job.job_type || 'offline',
    experience: job.experience || 0,
    city, district,
    num_slot: job.num_slot ?? '',
    salary_min: job.salary_min ?? '',
    salary_max: job.salary_max ?? '',
    expiry_date: job.expiry_date ? String(job.expiry_date).slice(0, 10) : '',
    education_level: job.education_level || EDUCATION_OPTIONS[0],
    role: job.role || ROLE_OPTIONS[0],
    description: job.description || '',
    requirements: job.requirements || '',
    working_shifts: job.working_shifts || '',
    benefits: job.benefits || ''
  };
};

const validateForm = (f, isEdit) => {
  if (!f.title.trim()) return 'Vui lòng nhập tiêu đề tin tuyển dụng';
  if (!f.num_slot || Number(f.num_slot) < 1) return 'Số lượng cần tuyển phải từ 1 trở lên';
  if (f.salary_min === '' || f.salary_max === '') return 'Vui lòng nhập mức lương tối thiểu và tối đa';
  if (Number(f.salary_min) < 0 || Number(f.salary_max) < 0) return 'Mức lương không hợp lệ';
  if (Number(f.salary_min) > Number(f.salary_max)) return 'Lương tối thiểu không được lớn hơn lương tối đa';
  if (!f.expiry_date) return 'Vui lòng chọn hạn nộp hồ sơ';
  if (!isEdit && new Date(f.expiry_date) < todayStart()) return 'Hạn nộp hồ sơ phải từ hôm nay trở đi';
  if (!f.description.trim() || !f.requirements.trim() || !f.working_shifts.trim() || !f.benefits.trim()) {
    return 'Vui lòng nhập đầy đủ mô tả, yêu cầu, thời gian làm việc và quyền lợi';
  }
  return '';
};

const FIELD_STYLE = {
  width: '100%', height: 44, padding: '0 14px', borderRadius: 12, background: C.white,
  border: `1px solid ${C.border}`, fontSize: 14, outline: 'none', boxSizing: 'border-box'
};

const JobFormModal = ({ open, onClose, job, isEdit, onSaved }) => {
  const [form, setForm] = useState(() => (isEdit && job ? formFromJob(job) : emptyForm()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    const msg = validateForm(form, isEdit);
    if (msg) {
      setError(msg);
      return;
    }
    setSaving(true);
    setError('');
    const location = form.district.trim() ? `${form.district.trim()}, ${form.city}` : form.city;
    const payload = {
      title: form.title.trim(),
      job_type: form.job_type,
      experience: Number(form.experience),
      location,
      num_slot: Number(form.num_slot),
      salary_min: Number(form.salary_min),
      salary_max: Number(form.salary_max),
      expiry_date: form.expiry_date,
      education_level: form.education_level,
      role: form.role,
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      working_shifts: form.working_shifts.trim(),
      benefits: form.benefits.trim()
    };
    try {
      if (isEdit) {
        await jobService.updateJob({ job_id: job.job_id, ...payload });
      } else {
        await jobService.addJob({
          job_id: crypto.randomUUID(),
          employer_id: getCurrentUser().emp_id,
          is_active: true,
          ...payload
        });
      }
      onSaved(isEdit ? 'Đã lưu thay đổi tin tuyển dụng' : 'Đã đăng tin tuyển dụng');
      onClose();
    } catch (err) {
      setError(/duplicate|unique/i.test(err.message)
        ? 'Tiêu đề này đã được sử dụng, vui lòng đặt tiêu đề khác'
        : err.message);
    } finally {
      setSaving(false);
    }
  };

  const opts = (list) => list.map(o => ({ value: o, label: o }));
  // Các mục của form; cols = số cột của lưới trong mục
  const formSections = [
    {
      title: 'Thông tin cơ bản', icon: FileText, cols: 2, fields: [
        { key: 'title', label: 'Tiêu đề tin tuyển dụng', placeholder: 'VD: Nhân viên phục vụ ca tối', required: true, full: true },
        { key: 'job_type', label: 'Hình thức làm việc', type: 'select', required: true,
          options: Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({ value, label })) },
        { key: 'role', label: 'Cấp bậc', type: 'select', options: opts(ROLE_OPTIONS) }
      ]
    },
    {
      title: 'Địa điểm & số lượng', icon: MapPin, cols: 3, fields: [
        { key: 'city', label: 'Tỉnh/Thành phố', type: 'select', options: opts(CITIES) },
        { key: 'district', label: 'Phường/Xã', placeholder: 'VD: Phường Bến Thành' },
        { key: 'num_slot', label: 'Số lượng cần tuyển', type: 'number', required: true, suffix: 'người' }
      ]
    },
    {
      title: 'Mức lương & thời hạn', icon: Wallet, cols: 3, fields: [
        { key: 'salary_min', label: 'Lương tối thiểu', type: 'number', required: true, suffix: 'đ/giờ' },
        { key: 'salary_max', label: 'Lương tối đa', type: 'number', required: true, suffix: 'đ/giờ' },
        { key: 'expiry_date', label: 'Hạn nộp hồ sơ', type: 'date', required: true }
      ]
    },
    {
      title: 'Yêu cầu ứng viên', icon: GraduationCap, cols: 2, fields: [
        { key: 'experience', label: 'Kinh nghiệm', type: 'select', options: EXPERIENCE_OPTIONS },
        { key: 'education_level', label: 'Trình độ học vấn', type: 'select', options: opts(EDUCATION_OPTIONS) }
      ]
    },
    {
      title: 'Nội dung tin', icon: ListChecks, cols: 1, hint: 'Mỗi ý viết trên một dòng', fields: [
        { key: 'description', label: 'Mô tả công việc', type: 'textarea', required: true },
        { key: 'requirements', label: 'Yêu cầu ứng viên', type: 'textarea', required: true },
        { key: 'working_shifts', label: 'Thời gian làm việc', type: 'textarea', required: true },
        { key: 'benefits', label: 'Quyền lợi', type: 'textarea', required: true }
      ]
    }
  ];

  const renderField = (field) => (
    <div key={field.key} style={{ gridColumn: field.full ? '1 / -1' : 'auto', minWidth: 0 }}>
      <label style={{ ...txt(13, 600), display: 'block', marginBottom: 8 }}>
        {field.label} {field.required && <span style={{ color: C.red }}>*</span>}
      </label>
      {field.type === 'select' ? (
        <Select value={form[field.key]} onChange={set(field.key)} style={FIELD_STYLE}>
          {field.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      ) : field.type === 'textarea' ? (
        <textarea
          placeholder={`Nhập ${field.label.toLowerCase()} (mỗi ý một dòng)`}
          value={form[field.key]}
          onChange={set(field.key)}
          style={{ ...FIELD_STYLE, height: 'auto', minHeight: 96, padding: '12px 14px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            type={field.type || 'text'}
            min={field.type === 'number' ? 0 : undefined}
            value={form[field.key]}
            onChange={set(field.key)}
            placeholder={field.placeholder}
            style={{ ...FIELD_STYLE, paddingRight: field.suffix ? 64 : 14 }}
          />
          {field.suffix && (
            <span style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              ...txt(13, 500, C.grayLight), pointerEvents: 'none'
            }}>
              {field.suffix}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001,
        ...flex('center'), justifyContent: 'center', padding: 24, overflowY: 'auto'
      }}>
        <div style={{
          background: C.white, borderRadius: 18,
          width: '100%', maxWidth: 900,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            ...flex('center'), justifyContent: 'space-between',
            padding: '22px 32px', borderBottom: `1px solid ${C.border}`,
            position: 'sticky', top: 0, background: C.white, zIndex: 2
          }}>
            <h2 style={{ ...txt(22, 700) }}>
              {isEdit ? 'Sửa tin tuyển dụng' : 'Đăng tin tuyển dụng'}
            </h2>
            <button onClick={onClose} title="Đóng" style={{
              width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white,
              cursor: 'pointer', ...flex('center'), justifyContent: 'center'
            }}>
              <X size={18} color={C.gray} />
            </button>
          </div>

          <div style={{ padding: '24px 32px', background: C.white, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {formSections.map(section => {
              const Icon = section.icon;
              return (
                <div key={section.title} style={FORM_SECTION}>
                  <div style={{ ...flex('center'), gap: 10, marginBottom: 18 }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 9, background: C.blueLight, flexShrink: 0,
                      ...flex('center'), justifyContent: 'center'
                    }}>
                      <Icon size={17} color={C.purple} />
                    </span>
                    <h3 style={{ ...txt(16, 700) }}>{section.title}</h3>
                    {section.hint && (
                      <span style={{
                        padding: '3px 10px', borderRadius: 999, background: C.grayBg,
                        border: `1px solid ${C.border}`, ...txt(12, 500, C.gray)
                      }}>
                        {section.hint}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${section.cols}, minmax(0, 1fr))`, gap: 16 }}>
                    {section.fields.map(renderField)}
                  </div>
                </div>
              );
            })}

            {error && (
              <div style={{
                ...flex('center'), gap: 8, padding: '12px 14px', borderRadius: 12,
                background: C.redBg, border: '1px solid #fbcaca', ...txt(14, 500, C.red)
              }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>

          <div style={{
            padding: '20px 32px', borderTop: `1px solid ${C.border}`,
            ...flex('center'), justifyContent: 'flex-end', gap: 12
          }}>
            <button onClick={onClose} style={{
              height: 42, padding: '0 22px', borderRadius: 12,
              border: `1px solid ${C.border}`, background: C.white,
              color: C.navy, fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>
              Hủy
            </button>
            <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              height: 42, padding: '0 22px', borderRadius: 12, border: 'none',
              background: C.purple, color: C.white,
              fontSize: 14, fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1
            }}>
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Đăng tin'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Xác nhận xóa ───────────────────────────────────────────── */

const DeleteConfirmModal = ({ open, onClose, onConfirm, jobTitle, busy }) => {
  if (!open) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001, width: '100%', maxWidth: 480,
        background: C.white, borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: 32, textAlign: 'center'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: C.redBg, margin: '0 auto 20px',
          ...flex('center'), justifyContent: 'center'
        }}>
          <Trash2 size={32} color={C.red} />
        </div>
        <h2 style={{ ...txt(22, 700), marginBottom: 12 }}>Xác nhận xóa</h2>
        <p style={{ ...txt(15, 400, C.gray), marginBottom: 24 }}>
          Bạn có chắc chắn muốn xóa tin tuyển dụng "<strong>{jobTitle}</strong>"?
          Hành động này không thể hoàn tác.
        </p>
        <div style={{ ...flex('center'), justifyContent: 'center', gap: 12 }}>
          <button onClick={onClose} style={{
            padding: '12px 28px', borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.white,
            color: C.navy, fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}>
            Hủy
          </button>
          <button onClick={onConfirm} disabled={busy} style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: C.red, color: C.white,
            fontSize: 15, fontWeight: 600,
            cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1
          }}>
            {busy ? 'Đang xóa...' : 'Xóa tin'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Trang chính ────────────────────────────────────────────── */

// Chip lọc trạng thái tin tuyển dụng ('' = tất cả)
const STATUS_TABS = [
  { id: '', label: 'Tất cả' },
  { id: 'active', label: 'Đang hoạt động' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'paused', label: 'Tạm dừng' },
  { id: 'expired', label: 'Hết hạn' },
  { id: 'rejected', label: 'Từ chối duyệt' }
];

export default function JobManagement() {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const clearNotice = useCallback(() => setNotice(null), []);

  const [selectedJobs, setSelectedJobs] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  // ?new=1 (từ nút "Đăng tin tuyển dụng" ở trang chủ) → mở sẵn form tạo tin
  const [searchParams, setSearchParams] = useSearchParams();
  const [createModalOpen, setCreateModalOpen] = useState(() => searchParams.get('new') === '1');
  useEffect(() => {
    if (searchParams.get('new') === '1') setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [busy, setBusy] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', date: '' });
  const [page, setPage] = useState(1);

  const loadJobs = () =>
    jobService.getJobsByEmployer(getCurrentUser().emp_id)
      .then(list => setAllJobs(list.map(toRow)))
      .catch(err => setNotice({ type: 'error', text: `Không tải được tin tuyển dụng: ${err.message}` }))
      .finally(() => setLoading(false));

  // Chỉ tải khi mở trang
  useEffect(() => { loadJobs(); }, []);

  const showNotice = (text, type = 'success') => setNotice({ type, text });

  const jobs = useMemo(() => {
    const q = normalize(filters.q.trim());
    return allJobs.filter(job =>
      (!q || normalize(job.title).includes(q)) &&
      (!filters.status || job.status === filters.status) &&
      (!filters.date || job.createdIso === filters.date)
    );
  }, [allJobs, filters]);

  const rowsPerPage = 5;
  const total = jobs.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentJobs = jobs.slice(start, end);

  const count = (status) => allJobs.filter(j => j.status === status).length;
  const stats = [
    { icon: Briefcase, label: 'Tổng tin đăng', value: allJobs.length, bgColor: C.grayBg },
    { icon: TrendingUp, label: 'Đang hoạt động', value: count('active'), bgColor: C.greenBg },
    { icon: Hourglass, label: 'Chờ duyệt', value: count('pending'), bgColor: C.blueLight },
    { icon: PauseCircle, label: 'Tạm dừng', value: count('paused'), bgColor: C.yellowBg },
    { icon: Clock, label: 'Hết hạn', value: count('expired'), bgColor: C.grayBg },
    { icon: XCircle, label: 'Từ chối duyệt', value: count('rejected'), bgColor: C.redBg }
  ];

  const applyFilters = () => {
    setFilters(f => ({ ...f, q: searchQuery, date: dateFilter }));
    setPage(1);
  };

  const selectStatus = (status) => {
    setFilters(f => ({ ...f, status }));
    setPage(1);
  };

  const handleCheckJob = (jobId) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId));
    } else {
      setSelectedJobs([...selectedJobs, jobId]);
    }
  };

  const pageIds = currentJobs.map(j => j.id);
  const allPageChecked = pageIds.length > 0 && pageIds.every(id => selectedJobs.includes(id));
  const toggleAllPage = () => {
    setSelectedJobs(allPageChecked
      ? selectedJobs.filter(id => !pageIds.includes(id))
      : [...new Set([...selectedJobs, ...pageIds])]);
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Xóa ${selectedJobs.length} tin tuyển dụng đã chọn? Hành động này không thể hoàn tác.`)) return;
    setBusy(true);
    const results = await Promise.allSettled(selectedJobs.map(id => jobService.deleteJob(id)));
    const failed = results.filter(r => r.status === 'rejected').length;
    setBusy(false);
    setSelectedJobs([]);
    showNotice(failed ? `Đã xóa ${results.length - failed} tin, ${failed} tin xóa thất bại` : `Đã xóa ${results.length} tin`, failed ? 'error' : 'success');
    loadJobs();
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await jobService.deleteJob(selectedJob.job_id);
      showNotice('Đã xóa tin tuyển dụng');
      setSelectedJobs(selectedJobs.filter(id => id !== selectedJob.job_id));
      loadJobs();
    } catch (err) {
      showNotice(err.message, 'error');
    } finally {
      setBusy(false);
      setDeleteModalOpen(false);
      setSelectedJob(null);
    }
  };

  const handleToggle = async (job) => {
    if (!job.canToggle) return;
    try {
      await jobService.updateJob({ job_id: job.job_id, is_active: !job.enabled });
      setAllJobs(list => list.map(j => j.job_id === job.job_id ? toRow({ ...j, is_active: !job.enabled }) : j));
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <PageHeader
          title="Tin tuyển dụng"
          subtitle="Tạo và quản lý các tin tuyển dụng của công ty"
        >
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              padding: '12px 24px', borderRadius: 10,
              border: 'none', background: C.purple,
              color: C.white, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', ...flex('center'), gap: 8
            }}
          >
            <Plus size={18} /> Tạo tin mới
          </button>
        </PageHeader>
        <Toast message={notice} onClose={clearNotice} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', // 2 hàng x 3 cột
          gap: 16,
          marginBottom: 32
        }}>
          {stats.map((stat, i) => (
            // Nội dung nằm ngang: icon bên trái, nhãn + số bên phải
            <div key={i} style={{
              background: C.white,
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              padding: '16px 20px',
              ...flex('center'),
              gap: 16
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: stat.bgColor,
                ...flex('center'), justifyContent: 'center'
              }}>
                <stat.icon size={24} color={C.navy} />
              </div>
              <p style={{ ...txt(14, 500, C.gray), flex: 1, minWidth: 0 }}>{stat.label}</p>
              <p style={{ ...txt(26, 700), flexShrink: 0 }}>{loading ? '…' : stat.value}</p>
            </div>
          ))}
        </div>

        {/* Thẻ tìm kiếm */}
        <div style={{ ...card(), padding: 14, marginBottom: 14, ...flex('center'), gap: 10 }}>
          <div style={{ ...flex('center'), gap: 10, flex: 1, ...field() }}>
            <Search size={18} color={C.grayLight} />
            <input
              placeholder="Tìm kiếm tin tuyển dụng"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              style={{ border: 'none', outline: 'none', boxShadow: 'none', fontSize: 14, flex: 1, background: 'transparent' }}
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            title="Lọc theo ngày đăng"
            style={{
              ...field(),
              fontSize: 14, color: C.darkGray, outline: 'none', minWidth: 160
            }}
          />
          <button
            onClick={applyFilters}
            style={{
              height: 44, padding: '0 22px', borderRadius: 12, border: 'none', background: C.purple,
              color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer', ...flex('center'), gap: 8
            }}
          >
            <Search size={16} /> Tìm kiếm
          </button>
        </div>

        {/* Thẻ lọc trạng thái: bấm chip là lọc ngay */}
        <div style={{ ...card(), padding: '12px 16px', marginBottom: 24, ...flex('center'), gap: 10, flexWrap: 'wrap' }}>
          <span style={{ ...txt(14, 600, C.gray), marginRight: 4 }}>Lọc:</span>
          {STATUS_TABS.map(tab => {
            const active = filters.status === tab.id;
            const n = tab.id ? count(tab.id) : allJobs.length;
            return (
              <button
                key={tab.id || 'all'}
                onClick={() => selectStatus(tab.id)}
                style={{
                  height: 36, padding: '0 16px', borderRadius: 999, cursor: 'pointer',
                  border: `1px solid ${active ? C.purple : C.border}`,
                  background: active ? C.purple : C.grayBg,
                  color: active ? C.white : C.darkGray,
                  fontSize: 13, fontWeight: 600, ...flex('center'), gap: 8
                }}
              >
                {tab.label}
                <span style={{
                  minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: active ? 'rgba(255,255,255,0.25)' : C.white, color: active ? C.white : C.gray,
                  ...flex('center'), justifyContent: 'center'
                }}>
                  {n}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{
          background: C.white,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          overflow: 'hidden'
        }}>
          {currentJobs.length > 0 ? (
            <>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${C.border}`,
                ...flex('center'),
                justifyContent: 'space-between'
              }}>
                <h2 style={{ ...txt(18, 700) }}>Danh sách tin tuyển dụng ({jobs.length})</h2>
                {selectedJobs.length > 0 && (
                  <div style={{ ...flex('center'), gap: 8 }}>
                    <span style={{ ...txt(14, 500, C.gray) }}>Đã chọn: {selectedJobs.length}</span>
                    <button
                      onClick={handleDeleteSelected}
                      disabled={busy}
                      style={{
                        padding: '8px 16px', borderRadius: 8,
                        border: 'none', background: C.red,
                        color: C.white, fontSize: 13, fontWeight: 600,
                        cursor: busy ? 'wait' : 'pointer', ...flex('center'), gap: 6
                      }}
                    >
                      <Trash2 size={14} /> Xóa
                    </button>
                  </div>
                )}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.grayBg }}>
                    <th style={{ width: 40, padding: '16px 20px', verticalAlign: 'middle' }}>
                      <input type="checkbox" checked={allPageChecked} onChange={toggleAllPage} style={CHECKBOX} />
                    </th>
                    {['TIN TUYỂN DỤNG', 'TRẠNG THÁI', 'NGÀY ĐĂNG', 'NGÀY HẾT HẠN', 'HIỂN THỊ', 'THAO TÁC'].map(h => (
                      <th key={h} style={{
                        ...txt(12, 700, C.gray),
                        textAlign: 'left',
                        padding: '16px 20px',
                        textTransform: 'uppercase'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentJobs.map(job => (
                <tr key={job.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => handleCheckJob(job.id)}
                      style={CHECKBOX}
                    />
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ ...txt(14, 600) }}>{job.title}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '6px 14px', borderRadius: 16,
                      background: job.statusColor,
                      color: job.statusText,
                      fontSize: 13, fontWeight: 600
                    }}>
                      {job.statusLabel}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ ...txt(14, 400) }}>{job.createdDate}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ ...txt(14, 400) }}>{job.expiryDate}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <label
                    onClick={() => handleToggle(job)}
                    title={job.canToggle ? (job.enabled ? 'Ẩn tin' : 'Hiển thị tin') : 'Tin đã hết hạn'}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: 44,
                      height: 24,
                      cursor: job.canToggle ? 'pointer' : 'not-allowed',
                      opacity: job.canToggle ? 1 : 0.5
                    }}>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: job.enabled && job.canToggle ? C.green : C.gray,
                        borderRadius: 12,
                        transition: 'all 0.3s'
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: 2,
                        left: job.enabled && job.canToggle ? 22 : 2,
                        width: 20,
                        height: 20,
                        background: C.white,
                        borderRadius: '50%',
                        transition: 'all 0.3s'
                      }} />
                    </label>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ ...flex('center'), gap: 8 }}>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setViewModalOpen(true);
                        }}
                        title="Xem chi tiết"
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          border: 'none', background: C.blueLight,
                          cursor: 'pointer',
                          ...flex('center'), justifyContent: 'center'
                        }}
                      >
                        <Eye size={17} color={C.purple} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setEditModalOpen(true);
                        }}
                        title="Sửa"
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          border: 'none', background: C.greenBg,
                          cursor: 'pointer',
                          ...flex('center'), justifyContent: 'center'
                        }}
                      >
                        <Edit size={17} color={C.green} />
                      </button>
                      {job.showRenew && (
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setRenewModalOpen(true);
                          }}
                          title="Làm mới"
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            border: 'none', background: C.blueLight,
                            cursor: 'pointer',
                            ...flex('center'), justifyContent: 'center'
                          }}
                        >
                          <RefreshCw size={17} color={C.purple} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setDeleteModalOpen(true);
                        }}
                        title="Xóa"
                        style={{
                          width: 36, height: 36, borderRadius: 10,
                          border: 'none', background: C.redBg,
                          cursor: 'pointer',
                          ...flex('center'), justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={17} color={C.red} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

            <div style={{
              padding: '16px 20px',
              borderTop: `1px solid ${C.border}`,
              ...flex('center'),
              justifyContent: 'space-between'
            }}>
              <span style={{ ...txt(14, 400, C.gray) }}>
                Hiển thị {start + 1}-{Math.min(end, total)} trong tổng số {total} tin tuyển dụng
              </span>
              <div style={{ ...flex('center'), gap: 8 }}>
                  {totalPages > 3 && page > 1 && (
                    <button onClick={() => setPage(page - 1)} style={PAGE_BTN_STYLE}>←</button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p >= page - 1 && p <= page + 1)
                    .map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                            ...PAGE_BTN_STYLE,
                            border: p === page ? 'none' : PAGE_BTN_STYLE.border,
                            background: p === page ? C.blue : PAGE_BTN_STYLE.background,
                            color: p === page ? C.white : undefined
                        }}
                      >
                      {p}
                      </button>
                    ))}
                  {totalPages > 3 && page < totalPages && (
                    <button onClick={() => setPage(page + 1)} style={PAGE_BTN_STYLE}>→</button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div style={{
              padding: '80px 40px',
              textAlign: 'center'
            }}>
              <div style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                background: C.grayBg,
                margin: '0 auto 20px',
                ...flex('center'),
                justifyContent: 'center'
              }}>
                <Briefcase size={40} color={C.grayLight} />
              </div>
              <h3 style={{ ...txt(20, 600), marginBottom: 8 }}>
                {loading ? 'Đang tải...' : allJobs.length ? 'Không có tin phù hợp với bộ lọc' : 'Chưa có tin tuyển dụng nào'}
              </h3>
              {!loading && !allJobs.length && (
                <p style={{ ...txt(15, 400, C.gray), marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
                  Bắt đầu đăng tin tuyển dụng đầu tiên của bạn để tìm kiếm ứng viên tiềm năng cho công ty.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <ViewJobModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
      />

      {editModalOpen && (
        <JobFormModal
          open
          onClose={() => {
            setEditModalOpen(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          isEdit
          onSaved={(msg) => { showNotice(msg); loadJobs(); }}
        />
      )}

      {createModalOpen && (
        <JobFormModal
          open
          onClose={() => setCreateModalOpen(false)}
          isEdit={false}
          onSaved={(msg) => { showNotice(msg); loadJobs(); }}
        />
      )}

      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedJob(null);
        }}
        onConfirm={handleDelete}
        busy={busy}
        jobTitle={selectedJob?.title}
      />

      {renewModalOpen && (
        <RenewJobModal
          open
          onClose={() => {
            setRenewModalOpen(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
        />
      )}
    </div>
  );
}
