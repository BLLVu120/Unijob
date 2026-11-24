import { useState, useEffect, useCallback } from 'react';
import {
  X, Check, CheckCircle, AlertCircle, Info, Building2, Mail, Hash, Layers, Users, Globe, MapPin,
  Search, FileSearch, ShieldCheck
} from 'lucide-react';
import { COLORS, TILE_GRADIENTS, GRADIENT } from '../../constants/colors';
import { flex, txt, card } from '../../utils/styles';
import { getCurrentUser, refreshSession, updateEmployerProfile, sendOtp, verifyOtp } from '../../services/authService';
import { verifyTaxCode } from '../../services/verificationService';
import PageHeader from '../../components/PageHeader';
import Toast from '../../components/Toast';
import { TileGrid, InfoTile } from '../../components/ProfileKit';
const C = COLORS;

/*
 * Quy trình xác thực doanh nghiệp (theo BE):
 *   1. Tra cứu mã số thuế (verify-tax-code)
 *   2. Gửi OTP tới email doanh nghiệp (send-otp)
 *   3. Nhập OTP (verify-otp) → đánh dấu is_verified
 */

const FIELD = {
  height: 44, padding: '0 14px', borderRadius: 12, border: `1px solid ${C.border}`,
  fontSize: 14, background: C.white, color: C.navy, outline: 'none', boxSizing: 'border-box'
};

const SectionTitle = ({ icon, children, extra }) => {
  const Icon = icon;
  return (
    <h2 style={{ ...txt(18, 700), marginBottom: 18, ...flex('center'), gap: 10, flexWrap: 'wrap' }}>
      <span style={{
        width: 34, height: 34, borderRadius: 10, background: C.blueLight,
        ...flex('center'), justifyContent: 'center'
      }}>
        <Icon size={18} color={C.purple} />
      </span>
      {children}
      {extra}
    </h2>
  );
};

export default function CompanyVerification() {
  const [employer, setEmployer] = useState(getCurrentUser);
  const [notice, setNotice] = useState(null);
  const clearNotice = useCallback(() => setNotice(null), []);
  const [status, setStatus] = useState(() => (getCurrentUser()?.is_verified ? 'verified' : 'not_verified'));
  const [taxId, setTaxId] = useState(() => getCurrentUser()?.tax_code || '');
  const [lookup, setLookup] = useState(null);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshSession()
      .then(fresh => {
        if (!fresh) return;
        setEmployer(fresh);
        if (fresh.is_verified) setStatus('verified');
      })
      .catch(() => {});
  }, []);


  const statusConfig = {
    not_verified: {
      bg: C.yellowBg,
      border: COLORS.amberBorderStrong,
      icon: AlertCircle,
      color: C.brown,
      title: 'Chưa xác thực',
      message: 'Nhập mã số thuế và bấm "Tra cứu & xác thực" để bắt đầu.',
      showButton: true,
      canEditTaxId: true
    },
    under_review: {
      bg: C.blueLight,
      border: C.blue,
      icon: Info,
      color: C.blue,
      title: 'Chờ xác nhận OTP',
      message: `Mã số thuế hợp lệ. Chúng tôi đã gửi mã OTP tới ${employer?.email}. Nhập mã để hoàn tất xác thực (hiệu lực 5 phút).`,
      showButton: false,
      canEditTaxId: false
    },
    verified: {
      bg: C.greenBg,
      border: C.green,
      icon: CheckCircle,
      color: C.green,
      title: 'Đã xác thực',
      message: 'Doanh nghiệp của bạn đã được xác thực thành công!',
      showButton: false,
      canEditTaxId: false
    },
    rejected: {
      bg: C.redBg,
      border: COLORS.redBorderStrong,
      icon: X,
      color: C.red,
      title: 'Bị từ chối',
      message: error || 'Mã số thuế không hợp lệ. Vui lòng kiểm tra lại.',
      showButton: true,
      canEditTaxId: true
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const handleRequest = async () => {
    const code = taxId.trim();
    if (!/^\d{10}(\d{3})?$/.test(code)) {
      setError('Mã số thuế phải gồm 10 hoặc 13 chữ số');
      setStatus('rejected');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await verifyTaxCode(code);
      setLookup(result);
      if (!result?.is_valid) {
        setError(result?.error || 'Không tìm thấy doanh nghiệp với mã số thuế này');
        setStatus('rejected');
        return;
      }
      if (code !== employer.tax_code) {
        setEmployer(await updateEmployerProfile({ tax_code: code }));
      }
      await sendOtp(employer.email);
      setOtp('');
      setStatus('under_review');
    } catch (err) {
      setError(err.message);
      setStatus('rejected');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Mã OTP gồm 6 chữ số');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await verifyOtp({ email: employer.email, role: 'employer' }, otp.trim());
      const fresh = await refreshSession();
      if (fresh) setEmployer(fresh);
      setStatus('verified');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleResendOtp = async () => {
    setBusy(true);
    setError('');
    try {
      await sendOtp(employer.email);
      setNotice({ type: 'success', text: `Đã gửi lại mã OTP tới ${employer.email}` });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const company = lookup?.company_info;

  // Nội dung khung "Kết quả tra cứu" theo trạng thái
  const result = status === 'verified' ? {
    icon: Check, gradient: GRADIENT.success,
    bg: C.greenBg, border: C.greenBorder, color: C.green, badge: 'Đã xác thực',
    title: 'Doanh nghiệp đã được xác thực',
    subtitle: 'Hồ sơ công ty hiển thị huy hiệu xác thực với ứng viên'
  } : company ? {
    icon: Building2, gradient: GRADIENT.purple,
    bg: C.blueLight, border: C.blueBorder, color: C.purple,
    badge: status === 'under_review' ? 'Chờ xác nhận OTP' : 'Đã tìm thấy',
    title: company.name,
    subtitle: company.internationalName || 'Thông tin doanh nghiệp theo mã số thuế'
  } : lookup?.is_valid ? {
    icon: Info, gradient: GRADIENT.purple,
    bg: C.blueLight, border: C.blueBorder, color: C.purple, badge: 'Hợp lệ',
    title: 'Mã số thuế đúng định dạng',
    subtitle: lookup.error || 'Không lấy được chi tiết doanh nghiệp'
  } : status === 'rejected' ? {
    icon: X, gradient: GRADIENT.danger,
    bg: C.redBg, border: C.redBorder, color: C.red, badge: 'Không hợp lệ',
    title: 'Không xác thực được',
    subtitle: error || 'Mã số thuế không hợp lệ. Vui lòng kiểm tra lại.'
  } : null;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <PageHeader title="Xác thực" subtitle="Xác thực doanh nghiệp để tăng độ tin cậy với ứng viên" />
        <Toast message={notice} onClose={clearNotice} />

        {/* ── Thông tin doanh nghiệp: 6 ô gradient, 2 hàng x 3 ô ── */}
        <div style={{ ...card(), padding: 24, marginBottom: 24 }}>
          <SectionTitle
            icon={Building2}
            extra={(
              <span title={config.message} style={{
                ...flex('center'), gap: 6, padding: '4px 12px', borderRadius: 999,
                background: config.bg, border: `1px solid ${config.border}`, ...txt(13, 600, config.color)
              }}>
                <StatusIcon size={14} /> {config.title}
              </span>
            )}
          >
            Thông tin doanh nghiệp
          </SectionTitle>
          <TileGrid>
            {[
              { icon: Building2, label: 'Tên công ty', value: employer?.emp_name },
              { icon: Hash, label: 'Mã số thuế', value: taxId || employer?.tax_code },
              { icon: Layers, label: 'Ngành nghề', value: employer?.field },
              { icon: Users, label: 'Quy mô', value: employer?.scope },
              { icon: Globe, label: 'Website', value: employer?.website },
              { icon: MapPin, label: 'Địa chỉ', value: employer?.address }
            ].map((f, i) => <InfoTile key={f.label} {...f} gradient={TILE_GRADIENTS[i]} />)}
          </TileGrid>

          {/* Nhãn ở trên (cùng kiểu nhãn ô OTP), ô nhập + nút ở dưới */}
          {config.canEditTaxId && (
            <div style={{
              marginTop: 16, padding: 16, borderRadius: 14, background: C.grayBg, border: `1px solid ${C.border}`
            }}>
              <label style={{ ...txt(13, 600), display: 'block', marginBottom: 8, ...flex('center'), gap: 6 }}>
                <Hash size={16} color={C.purple} /> Mã số thuế cần xác thực <span style={{ color: C.red }}>*</span>
              </label>
              <div style={{ ...flex('center'), gap: 10 }}>
                <input
                  value={taxId}
                  placeholder="Nhập 10 hoặc 13 chữ số, VD: 0123456789"
                  onChange={e => setTaxId(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleRequest()}
                  disabled={busy}
                  maxLength={13}
                  inputMode="numeric"
                  style={{ ...FIELD, flex: 1, letterSpacing: 1 }}
                />
                <button
                  onClick={handleRequest}
                  disabled={busy}
                  style={{
                    height: 44, padding: '0 20px', borderRadius: 12, border: 'none', background: C.purple,
                    color: C.white, fontSize: 14, fontWeight: 600, cursor: busy ? 'wait' : 'pointer',
                    opacity: busy ? 0.7 : 1, whiteSpace: 'nowrap', ...flex('center'), gap: 8
                  }}
                >
                  <Search size={16} /> {busy ? 'Đang kiểm tra...' : 'Tra cứu & xác thực'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Kết quả tra cứu ── */}
        <div style={{ ...card(), padding: 24 }}>
          <SectionTitle icon={FileSearch}>Kết quả tra cứu</SectionTitle>

          {result ? (
            <div style={{ borderRadius: 16, border: `1px solid ${result.border}`, overflow: 'hidden' }}>
              {/* Dải tiêu đề kết quả */}
              <div style={{ ...flex('center'), gap: 16, padding: '18px 20px', background: result.bg }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: result.gradient,
                  ...flex('center'), justifyContent: 'center', boxShadow: '0 6px 16px rgba(15, 23, 42, 0.12)'
                }}>
                  <result.icon size={26} color={C.white} strokeWidth={2.75} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...txt(17, 700) }}>{result.title}</p>
                  <p style={{ ...txt(13, 400, C.gray), marginTop: 2 }}>{result.subtitle}</p>
                </div>
                <span style={{
                  padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, flexShrink: 0,
                  background: C.white, color: result.color, border: `1px solid ${result.border}`
                }}>
                  {result.badge}
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              border: `2px dashed ${C.border}`, borderRadius: 16, padding: '36px 24px', textAlign: 'center'
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, background: C.blueLight, margin: '0 auto 12px',
                ...flex('center'), justifyContent: 'center'
              }}>
                <FileSearch size={26} color={C.purple} />
              </div>
              <p style={{ ...txt(15, 700), marginBottom: 4 }}>Chưa tra cứu</p>
              <p style={{ ...txt(13, 400, C.gray) }}>Nhập mã số thuế và bấm "Tra cứu & xác thực" để xem thông tin doanh nghiệp tại đây.</p>
            </div>
          )}

          {status === 'under_review' && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: C.grayBg, border: `1px solid ${C.border}` }}>
              <label style={{ ...txt(13, 600), display: 'block', marginBottom: 8, ...flex('center'), gap: 6 }}>
                <Mail size={16} color={C.purple} /> Mã OTP đã gửi tới {employer?.email} <span style={{ color: C.red }}>*</span>
              </label>
              <div style={{ ...flex('center'), gap: 10 }}>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                  placeholder="Nhập 6 chữ số"
                  inputMode="numeric"
                  style={{ ...FIELD, flex: 1, letterSpacing: 6, fontWeight: 600 }}
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={busy}
                  style={{
                    height: 44, padding: '0 20px', borderRadius: 12, border: 'none', background: C.green,
                    color: C.white, fontSize: 14, fontWeight: 600, cursor: busy ? 'wait' : 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  Xác nhận
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={busy}
                  style={{
                    height: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white,
                    ...txt(14, 600, C.purple), cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  Gửi lại mã
                </button>
              </div>
            </div>
          )}

          {error && status !== 'rejected' && (
            <p style={{ ...txt(13, 500, C.red), marginTop: 12 }}>{error}</p>
          )}

          <div style={{
            marginTop: 16, padding: '12px 14px', borderRadius: 12,
            background: C.blueLight, border: `1px solid ${C.blueBorder}`, ...flex('flex-start'), gap: 10
          }}>
            <ShieldCheck size={18} color={C.purple} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ ...txt(13, 400, C.darkGray), lineHeight: 1.5 }}>
              Thông tin được bảo mật tuyệt đối, chỉ dùng để xác thực doanh nghiệp và không chia sẻ với bên thứ ba.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
