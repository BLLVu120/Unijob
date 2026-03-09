import { CheckCircle, ArrowRight, Mail } from 'lucide-react';
import { COLORS } from '../constants/colors';
import { useLocation, useNavigate } from "react-router-dom";

const EmailVerificationSuccessPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userEmail = state?.email || "";
  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      background: COLORS.cream
    }}>
      <main style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '40px 24px'
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          background: COLORS.white,
          borderRadius: '20px',
          padding: '48px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${COLORS.green} 0%, #34d399 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            animation: 'scaleIn 0.5s ease-out'
          }}>
            <CheckCircle size={40} color={COLORS.white} strokeWidth={2} />
          </div>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: COLORS.navy,
            marginBottom: '8px'
          }}>
            Xác thực thành công!
          </h2>

          <p style={{
            fontSize: '15px',
            color: COLORS.gray,
            marginBottom: '16px',
            lineHeight: '1.6'
          }}>
            Email của bạn đã được xác thực
          </p>

          <div style={{
            background: COLORS.lightGray,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '12px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 18px'
          }}>
            <Mail size={18} color={COLORS.navy} />
            <span style={{
              fontSize: '15px',
              fontWeight: '600',
              color: COLORS.navy
            }}>
              {userEmail}
            </span>
          </div>

          <div style={{
            background: COLORS.greenBg,
            border: `1px solid ${COLORS.greenBorder}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <CheckCircle size={18} color="#065f46" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#065f46'
              }}>
                Tài khoản đã kích hoạt
              </span>
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: '26px',
              fontSize: '13px',
              color: '#065f46',
              lineHeight: '1.6'
            }}>
              <li>Bạn có thể đăng nhập và sử dụng đầy đủ tính năng</li>
              <li>Thông tin cá nhân của bạn đã được bảo mật</li>
              <li>Bắt đầu tìm kiếm công việc phù hợp ngay hôm nay</li>
            </ul>
          </div>

          <button
            onClick={handleContinue}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleGradient} 100%)`,
              color: COLORS.white,
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(139, 127, 214, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(139, 127, 214, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(139, 127, 214, 0.3)';
            }}
          >
            Đi tới trang đăng nhập
            <ArrowRight size={18} />
          </button>

          <p style={{
            fontSize: '13px',
            color: COLORS.gray,
            marginTop: '24px',
            lineHeight: '1.6'
          }}>
            Cảm ơn bạn đã tham gia UNIJOB. 
            <br />
            Chúc bạn tìm được công việc phù hợp!
          </p>
        </div>
      </main>

      <style>
        {`
          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default EmailVerificationSuccessPage;