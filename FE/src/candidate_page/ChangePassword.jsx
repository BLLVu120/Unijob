import { useState } from 'react';
import { Eye, EyeOff, Shield, Key, CheckCircle2 } from 'lucide-react';
import { COLORS } from '../constants/colors';
import { flex, txt } from '../utils/styles';
import { getCurrentUser, updateUser } from "../services/authService";
import Toast from "../components/Toast";

const C = COLORS;

const PasswordField = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);

  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ ...txt(14, 600), display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '12px 48px 12px 14px', borderRadius: 8,
            border: `1px solid ${C.border}`, fontSize: 14, color: C.navy,
            outline: 'none', background: C.white, boxSizing: 'border-box'
          }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, ...flex('center')
          }}
        >
          {show ? <Eye size={18} color={C.gray} /> : <EyeOff size={18} color={C.gray} />}
        </button>
      </div>
    </div>
  );
};


const InfoBox = ({ icon: Icon, title, items }) => (
  <div style={{
    background: C.yellow, border: `1px solid ${C.yellowBorder}`,
    borderRadius: 12, padding: '24px', marginBottom: 24
  }}>
    <h3 style={{ 
      ...txt(18, 700, C.brown), marginBottom: 16, 
      ...flex('center'), gap: 8 
    }}>
      <Icon size={20} color={C.brown} /> {title}
    </h3>
    <ul style={{ margin: 0 }}>
      {items.map((item, i) => (
        <li key={i} style={{ 
          ...txt(14, 400, C.brown), marginBottom: 8,
          listStyleType: 'none', position: 'relative', paddingLeft: 20
        }}>
          <CheckCircle2 
            size={14} 
            color={C.brown} 
            style={{ 
              position: 'absolute', left: 0, top: 4 
            }} 
          />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default function ChangePasswordPage() {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const currentUser = getCurrentUser();

      if (passwords.current !== currentUser.password) {
        setToast({ message: "Mật khẩu hiện tại không đúng", type: "error" });
        return;
      }

      if (passwords.new !== passwords.confirm) {
        setToast({ message: "Mật khẩu xác nhận không khớp", type: "warning" });
        return;
      }

      if (passwords.new.length < 8) {
        setToast({ message: "Mật khẩu mới phải ít nhất 8 ký tự", type: "warning" });
        return;
      }

      const updatedUser = {
        ...currentUser,
        password: passwords.new
      };

      await updateUser(updatedUser);

      setToast({ message: "Đổi mật khẩu thành công", type: "success" });

      setPasswords({
        current: "",
        new: "",
        confirm: ""
      });

    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  const handleReset = () => {
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const requirements = [
    'Tối thiểu 8 ký tự',
    'Có ít nhất 1 chữ hoa',
    'Có ít nhất 1 chữ thường',
    'Có ít nhất 1 số',
    'Có ít nhất 1 ký tự đặc biệt'
  ];

  const tips = [
    'Không sử dụng mật khẩu đã dùng trước đó',
    'Không chia sẻ mật khẩu với bất kỳ ai',
    'Sử dụng mật khẩu khác nhau cho các tài khoản',
    'Đổi mật khẩu định kỳ 3-6 tháng'
  ];

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: C.grayBg, minHeight: '100vh'
    }}>
      <main style={{ padding: '40px 48px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ ...txt(32, 700), marginBottom: 8 }}>Đổi mật khẩu</h1>
          <p style={{ ...txt(15, 400, C.gray) }}>
            Cập nhật mật khẩu của bạn để bảo mật tài khoản
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 480px', gap: 32, alignItems: 'start'
        }}>
          <div style={{
            background: C.white, borderRadius: 16, padding: 40,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <form onSubmit={handleSubmit}>
              <PasswordField
                label="Mật khẩu hiện tại"
                value={passwords.current}
                onChange={v => setPasswords({ ...passwords, current: v })}
                placeholder="Nhập mật khẩu hiện tại"
              />

              <PasswordField
                label="Mật khẩu mới"
                value={passwords.new}
                onChange={v => setPasswords({ ...passwords, new: v })}
                placeholder="Nhập mật khẩu mới"
              />

              <PasswordField
                label="Xác nhận mật khẩu mới"
                value={passwords.confirm}
                onChange={v => setPasswords({ ...passwords, confirm: v })}
                placeholder="Nhập lại mật khẩu mới"
              />

              <div style={{ 
                ...flex('center'), gap: 16, marginTop: 32 
              }}>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '14px', borderRadius: 10, border: 'none',
                    background: C.orange, color: C.white, fontSize: 16, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Cập nhật mật khẩu
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 10,
                    border: `1px solid ${C.border}`, background: C.white,
                    color: C.navy, fontSize: 16, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>

          <div style={{ position: 'sticky', top: 40 }}>
            <InfoBox 
              icon={Shield} 
              title="Yêu cầu mật khẩu" 
              items={requirements} 
            />
            <InfoBox 
              icon={Key} 
              title="Mẹo bảo mật" 
              items={tips} 
            />
          </div>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        input:focus {
          border-color: ${C.blue} !important;
        }
        input::placeholder {
          color: ${C.grayLight};
        }
      `}</style>
    </div>
  );
}