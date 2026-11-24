import { CheckCircle2, ArrowRight, Mail, Check, Search } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { COLORS, SHADOW } from '../constants/colors';
import { flex, txt } from '../utils/styles';

const C = COLORS;

const STEPS = ['Đăng ký', 'Xác thực email', 'Hoàn tất'];
const SUCCESS_GRADIENT = 'linear-gradient(135deg, #059669 0%, #10b981 55%, #34d399 100%)';

const VerificationConfirmationPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userEmail = state?.email;

  // Chỉ vào được trang này sau khi xác thực xong
  if (!userEmail) return <Navigate to="/login" replace />;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      minHeight: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #effbf5 0%, #f8f9fc 60%)',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Khối trang trí nền */}
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.16) 0%, rgba(16,185,129,0) 70%)', top: -220, left: -160 }} />
      <div style={{ position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,93,252,0.12) 0%, rgba(109,93,252,0) 70%)', bottom: -200, right: -140 }} />

      <main style={{ position: 'relative', flex: 1, ...flex('center'), justifyContent: 'center', padding: '40px 24px 56px' }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          {/* Thanh các bước: đã xong cả 3 */}
          <div style={{ ...flex('center'), justifyContent: 'center', gap: 10, marginBottom: 22 }}>
            {STEPS.map((step, i) => {
              const last = i === STEPS.length - 1;
              return (
                <div key={step} style={{ ...flex('center'), gap: 10 }}>
                  <span style={{ ...flex('center'), gap: 8 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: '50%', ...flex('center'), justifyContent: 'center',
                      background: C.green, color: C.white,
                      boxShadow: last ? '0 0 0 4px rgba(21,160,90,0.18)' : 'none'
                    }}>
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <span style={{ ...txt(13, last ? 700 : 500, last ? C.navy : C.gray) }}>{step}</span>
                  </span>
                  {!last && <span style={{ width: 28, height: 2, borderRadius: 2, background: C.green }} />}
                </div>
              );
            })}
          </div>

          <div style={{
            background: C.white, borderRadius: 24, border: `1px solid ${C.border}`,
            boxShadow: '0 24px 60px rgba(5, 150, 105, 0.12)', overflow: 'hidden'
          }}>
            {/* Đầu thẻ gradient xanh lá */}
            <div style={{ background: SUCCESS_GRADIENT, padding: '32px 32px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.10)', top: -90, right: -60 }} />
              <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', bottom: -80, left: -40 }} />
              <div style={{
                position: 'relative', width: 76, height: 76, borderRadius: '50%', margin: '0 auto 16px',
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
                ...flex('center'), justifyContent: 'center',
                boxShadow: '0 0 0 10px rgba(255,255,255,0.08)'
              }}>
                <CheckCircle2 size={40} color={C.white} strokeWidth={1.8} />
              </div>
              <h1 style={{ position: 'relative', ...txt(26, 800, C.white), marginBottom: 6 }}>Xác thực thành công!</h1>
              <p style={{ position: 'relative', ...txt(14, 400, 'rgba(255,255,255,0.9)'), marginBottom: 14 }}>
                Tài khoản của bạn đã được kích hoạt
              </p>
              <span style={{
                position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                borderRadius: 999, background: C.white, ...txt(14, 700, C.greenDark),
                boxShadow: '0 6px 16px rgba(15, 23, 42, 0.15)', maxWidth: '100%'
              }}>
                <Mail size={16} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</span>
              </span>
            </div>

            <div style={{ padding: '26px 32px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  height: 50, borderRadius: 14, border: 'none', background: C.purple, boxShadow: SHADOW.primary,
                  ...txt(15, 700, C.white), cursor: 'pointer',
                  ...flex('center'), justifyContent: 'center', gap: 8
                }}
              >
                Đi tới trang đăng nhập <ArrowRight size={18} />
              </button>

              <Link
                to="/jobs"
                style={{
                  height: 50, borderRadius: 14, border: `1px solid ${C.border}`, background: C.white,
                  ...flex('center'), justifyContent: 'center', gap: 8, textDecoration: 'none',
                  ...txt(15, 700, C.darkGray)
                }}
              >
                <Search size={18} /> Khám phá việc làm
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default VerificationConfirmationPage;
