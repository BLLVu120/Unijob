import { Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { COLORS } from '../constants/colors';

const EmailVerificationPage = () => {
  const userEmail = 'user@example.com';

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
        minHeight: 'calc(100vh - 76px)',
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
            background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleGradient} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Mail size={40} color={COLORS.white} strokeWidth={2} />
          </div>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: COLORS.navy,
            marginBottom: '8px'
          }}>
            Kiểm tra email của bạn
          </h2>

          <p style={{
            fontSize: '15px',
            color: COLORS.gray,
            marginBottom: '16px',
            lineHeight: '1.6'
          }}>
            Chúng tôi đã gửi một email xác minh đến
          </p>

          <div style={{
            background: COLORS.lightGray,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Mail size={18} color={COLORS.navy} />
            <span style={{
              fontSize: '15px',
              fontWeight: '600',
              color: COLORS.navy,
              padding: '12px 18px 12px 12px',
              borderRadius: '8px',
            }}>
              {userEmail}
            </span>
          </div>

          <div style={{
            background: COLORS.yellow,
            border: `1px solid ${COLORS.yellowBorder}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <AlertCircle size={18} color="#92400e" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#92400e'
              }}>
                Vui lòng kiểm tra email
              </span>
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: '26px',
              fontSize: '13px',
              color: '#92400e',
              lineHeight: '1.6'
            }}>
              <li>Nhấp vào liên kết trong email để xác minh tài khoản</li>
              <li>Kiểm tra cả thư mục spam nếu không thấy email</li>
              <li>Liên kết sẽ hết hạn sau 24 giờ</li>
            </ul>
          </div>

          <div style={{
            background: COLORS.blueLight,
            border: `1px solid ${COLORS.blueBorder}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <AlertCircle size={18} color="#1e40af" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#1e40af',
                lineHeight: '1.6'
              }}>
                <strong>Bảo mật:</strong> Chúng tôi sẽ không bao giờ yêu cầu mật khẩu qua email. 
                Nếu nhận được email đáng ngờ, vui lòng báo cáo ngay.
              </p>
            </div>
          </div>

          <p style={{
            fontSize: '14px',
            color: COLORS.gray,
            marginBottom: '16px'
          }}>
            Không nhận được email?
          </p>

          <button
            onClick={() => console.log('Resend email')}
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
          >
            <RefreshCw size={18} />
            Gửi lại email
          </button>
        </div>
      </main>
    </div>
  );
};

export default EmailVerificationPage;