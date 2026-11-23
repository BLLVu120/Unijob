import { useState, useRef } from 'react';
import { Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { COLORS } from '../constants/colors';

const EmailVerificationPage = () => {
  const userEmail = 'user@example.com';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

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

  const handleVerify = (codeString) => {
    setIsVerifying(true);
    
    setTimeout(() => {
      if (codeString === '123456') {
        console.log('Verification successful!');
      } else {
        setError('Mã xác nhận không đúng. Vui lòng thử lại.');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleResend = () => {
    console.log('Resend code');
    setCode(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
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
            background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleGradient} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Mail size={40} color={COLORS.white} strokeWidth={2} />
          </div>

          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: COLORS.navy,
            marginBottom: '8px'
          }}>
            Xác thực email
          </h2>

          <p style={{
            fontSize: '15px',
            color: COLORS.gray,
            marginBottom: '16px',
            lineHeight: '1.6'
          }}>
            Chúng tôi đã gửi mã xác nhận 6 chữ số đến
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

          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: COLORS.navy,
            marginBottom: '16px'
          }}>
            Nhập mã xác nhận
          </p>

          {/* 6-digit code input */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isVerifying}
                style={{
                  width: '56px',
                  height: '64px',
                  fontSize: '24px',
                  fontWeight: '700',
                  textAlign: 'center',
                  border: error 
                    ? `2px solid ${COLORS.red}` 
                    : digit 
                      ? `2px solid ${COLORS.purple}` 
                      : `2px solid ${COLORS.border}`,
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  background: isVerifying ? COLORS.lightGray : COLORS.white,
                  color: COLORS.navy,
                  cursor: isVerifying ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => {
                  if (!error) {
                    e.target.style.borderColor = COLORS.purple;
                    e.target.style.boxShadow = `0 0 0 3px ${COLORS.purpleGradient}33`;
                  }
                }}
                onBlur={(e) => {
                  if (!error && !digit) {
                    e.target.style.borderColor = COLORS.border;
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            ))}
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '16px',
              color: COLORS.red,
              fontSize: '13px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {isVerifying && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '16px',
              color: COLORS.purple,
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: `2px solid ${COLORS.purple}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <span>Đang xác thực...</span>
            </div>
          )}

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
                Lưu ý quan trọng
              </span>
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: '26px',
              fontSize: '13px',
              color: '#92400e',
              lineHeight: '1.6'
            }}>
              <li>Kiểm tra cả thư mục spam nếu không thấy email</li>
              <li>Mã xác nhận sẽ hết hạn sau 10 phút</li>
              <li>Không chia sẻ mã này với bất kỳ ai</li>
            </ul>
          </div>

          <p style={{
            fontSize: '14px',
            color: COLORS.gray,
            marginBottom: '16px'
          }}>
            Không nhận được mã?
          </p>

          <button
            onClick={handleResend}
            disabled={isVerifying}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: isVerifying 
                ? COLORS.lightGray 
                : `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleGradient} 100%)`,
              color: isVerifying ? COLORS.gray : COLORS.white,
              fontSize: '15px',
              fontWeight: '600',
              cursor: isVerifying ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: isVerifying ? 'none' : '0 4px 12px rgba(139, 127, 214, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={18} />
            Gửi lại mã
          </button>
        </div>
      </main>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EmailVerificationPage;