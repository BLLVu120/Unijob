import { useState, useRef, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  Mail, MailCheck, RefreshCw, AlertCircle, CheckCircle2, Loader2, ShieldCheck, Check, ArrowLeft, KeyRound
} from 'lucide-react';
import { COLORS, GRADIENT, SHADOW } from '../constants/colors';
import { flex, txt } from '../utils/styles';
import { getPendingUser, clearPendingUser, sendOtp, verifyOtp } from '../services/authService';

const C = COLORS;

const STEPS = ['Đăng ký', 'Xác thực email', 'Hoàn tất'];


const RESEND_COOLDOWN = 60;

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [pendingUser] = useState(getPendingUser);
  const userEmail = pendingUser?.email || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);
  const sentOnce = useRef(false);

  const requestOtp = async () => {
    setIsSending(true);
    setError('');
    setInfo('');
    try {
      await sendOtp(userEmail);
      setInfo('Đã gửi mã xác nhận. Mã có hiệu lực trong 5 phút.');
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(`Không gửi được mã: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Gửi mã ngay khi mở trang
  useEffect(() => {
    if (!userEmail || sentOnce.current) return;
    sentOnce.current = true;
    requestOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  // Đếm ngược cho nút "Gửi lại mã"
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split('').forEach((digit, i) => {
      if (i < 6) newCode[i] = digit;
    });
    setCode(newCode);

    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    if (pastedData.length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handleVerify = async (codeString) => {
    setIsVerifying(true);
    setError('');
    setInfo('');
    try {
      await verifyOtp(pendingUser, codeString);
      clearPendingUser();
      navigate('/verify-success', { state: { email: userEmail } });
    } catch (err) {
      setError(err.message || 'Mã xác nhận không đúng. Vui lòng thử lại.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (cooldown > 0 || isSending) return;
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    requestOtp();
  };


  // Không có tài khoản nào đang chờ xác thực → quay về trang đăng ký
  if (!pendingUser) return <Navigate to="/register" replace />;

  const resendDisabled = isVerifying || isSending || cooldown > 0;
  const filled = code.every(d => d !== '');
  const canSubmit = filled && !isVerifying;

  // Ô trạng thái nhỏ dưới ô nhập mã
  const status = error
    ? { icon: AlertCircle, text: error, color: C.red, bg: C.redBg, border: C.redBorder }
    : isVerifying
      ? { icon: Loader2, text: 'Đang xác thực...', color: C.purple, bg: C.blueLight, border: C.blueBorder, spin: true }
      : info
        ? { icon: CheckCircle2, text: info, color: C.green, bg: C.greenBg, border: C.greenBorder }
        : null;
  const StatusIcon = status?.icon;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      minHeight: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #f4f2ff 0%, #f8f9fc 60%)',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Khối trang trí nền */}
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,93,252,0.18) 0%, rgba(109,93,252,0) 70%)', top: -220, left: -160 }} />
      <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0) 70%)', bottom: -200, right: -140 }} />

      <main style={{ position: 'relative', flex: 1, ...flex('center'), justifyContent: 'center', padding: '40px 24px 56px' }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          {/* Thanh các bước: Đăng ký → Xác thực email → Hoàn tất */}
          <div style={{ ...flex('center'), justifyContent: 'center', gap: 10, marginBottom: 22 }}>
            {STEPS.map((step, i) => {
              const done = i < 1;
              const active = i === 1;
              return (
                <div key={step} style={{ ...flex('center'), gap: 10 }}>
                  <span style={{ ...flex('center'), gap: 8 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: '50%', ...flex('center'), justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      background: done ? C.green : active ? C.purple : C.white,
                      color: done || active ? C.white : C.grayLight,
                      border: done || active ? 'none' : `1px solid ${C.border}`,
                      boxShadow: active ? '0 0 0 4px rgba(109,93,252,0.15)' : 'none'
                    }}>
                      {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                    </span>
                    <span style={{ ...txt(13, active ? 700 : 500, active ? C.navy : C.gray) }}>{step}</span>
                  </span>
                  {i < STEPS.length - 1 && <span style={{ width: 28, height: 2, borderRadius: 2, background: done ? C.green : C.border }} />}
                </div>
              );
            })}
          </div>

          <div style={{
            background: C.white, borderRadius: 24, border: `1px solid ${C.border}`,
            boxShadow: '0 24px 60px rgba(67, 52, 201, 0.12)', overflow: 'hidden'
          }}>
            {/* Đầu thẻ gradient */}
            <div style={{ background: GRADIENT.hero, padding: '32px 32px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -90, right: -60 }} />
              <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -80, left: -40 }} />
              <div style={{
                position: 'relative', width: 76, height: 76, borderRadius: 22, margin: '0 auto 16px',
                background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)',
                ...flex('center'), justifyContent: 'center'
              }}>
                <MailCheck size={36} color={C.white} strokeWidth={1.8} />
              </div>
              <h1 style={{ position: 'relative', ...txt(26, 800, C.white), marginBottom: 6 }}>Xác thực email</h1>
              <p style={{ position: 'relative', ...txt(14, 400, 'rgba(255,255,255,0.85)'), marginBottom: 14 }}>
                Chúng tôi đã gửi mã xác nhận gồm 6 chữ số đến
              </p>
              <span style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                borderRadius: 999, background: C.white, ...txt(14, 700, C.purpleDark),
                boxShadow: '0 6px 16px rgba(15, 23, 42, 0.15)', maxWidth: '100%'
              }}>
                <Mail size={16} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</span>
              </span>
            </div>

            <div style={{ padding: '28px 32px 30px' }}>
              {/* Nhãn bọc thẻ */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999,
                  background: C.blueLight, border: `1px solid ${C.blueBorder}`, ...txt(13, 600, C.purple)
                }}>
                  <KeyRound size={14} /> Nhập mã xác nhận
                </span>
              </div>

              {/* 6 ô mã */}
              <div style={{ ...flex('center'), justifyContent: 'center', gap: 10, marginBottom: 18 }}>
                {code.map((digit, index) => (
                  <div key={index} style={{ ...flex('center'), gap: 10 }}>
                    <input
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      autoFocus={index === 0}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={isVerifying}
                      className="otp-box"
                      style={{
                        width: 52, height: 60, borderRadius: 14, textAlign: 'center',
                        ...txt(24, 700), outline: 'none', transition: 'all .15s ease',
                        border: `2px solid ${error ? C.red : digit ? C.purple : C.border}`,
                        background: error ? C.redBg : digit ? C.blueLight : C.grayBg,
                        cursor: isVerifying ? 'not-allowed' : 'text'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Thông báo + các nút: cột có khoảng cách cố định để không bị dính */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {status && (
                <div style={{
                  ...flex('center'), justifyContent: 'center', gap: 8, padding: '9px 14px', borderRadius: 12,
                  background: status.bg, border: `1px solid ${status.border}`, ...txt(13, 500, status.color)
                }}>
                  <StatusIcon size={16} style={{ flexShrink: 0, animation: status.spin ? 'spin .8s linear infinite' : 'none' }} />
                  <span>{status.text}</span>
                </div>
              )}

              {/* 2 nút: Gửi lại mã (viền) — Xác nhận (chính) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  onClick={handleResend}
                  disabled={resendDisabled}
                  style={{
                    height: 50, borderRadius: 14, border: `1px solid ${resendDisabled ? C.border : C.blueBorder}`,
                    background: resendDisabled ? C.grayBg : C.white,
                    ...txt(15, 700, resendDisabled ? C.grayLight : C.purple),
                    cursor: resendDisabled ? 'not-allowed' : 'pointer',
                    ...flex('center'), justifyContent: 'center', gap: 8, transition: 'all .2s ease'
                  }}
                >
                  <RefreshCw size={17} style={{ animation: isSending ? 'spin .8s linear infinite' : 'none' }} />
                  {isSending ? 'Đang gửi...' : cooldown > 0 ? `Gửi lại (${cooldown}s)` : 'Gửi lại mã'}
                </button>
                <button
                  onClick={() => handleVerify(code.join(''))}
                  disabled={!canSubmit}
                  style={{
                    height: 50, borderRadius: 14, border: 'none',
                    background: canSubmit ? GRADIENT.primary : C.grayBg,
                    boxShadow: canSubmit ? SHADOW.primary : 'none',
                    ...txt(15, 700, canSubmit ? C.white : C.grayLight),
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    ...flex('center'), justifyContent: 'center', gap: 8, transition: 'all .2s ease'
                  }}
                >
                  <ShieldCheck size={18} /> {isVerifying ? 'Đang xác thực...' : 'Xác nhận'}
                </button>
              </div>

              {/* Nút quay lại: nằm dưới 2 nút, chiếm toàn chiều ngang */}
              <Link
                to="/register"
                style={{
                  height: 46, borderRadius: 14, border: `1px solid ${C.border}`, background: C.white,
                  ...flex('center'), justifyContent: 'center', gap: 8, textDecoration: 'none',
                  ...txt(14, 600, C.darkGray)
                }}
              >
                <ArrowLeft size={17} /> Quay lại đăng ký
              </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .otp-box:focus { border-color: ${C.purple} !important; box-shadow: 0 0 0 4px rgba(109, 93, 252, 0.15); background: ${C.white} !important; }
      `}</style>
    </div>
  );
};

export default EmailVerificationPage;
