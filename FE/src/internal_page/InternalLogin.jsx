import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';
import { useAuth } from "../context/AuthContext";
import { loginInternal } from "../services/authService";
import Toast from "../components/Toast";
const C = COLORS;

const redirectMap = {
  admin: "/internal/admin/users",
  moderator: "/internal/moderator/job-approval",
};

export default function InternalLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const { loginInternal: authLoginInternal } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const user = loginInternal(username.trim(), password);
      authLoginInternal(user);
      navigate(redirectMap[user.role]);
    } 
    catch (err) {
      setToast({
        message: err.message,
        type: "error"
      });
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #a8c0ff 0%, #f8ceec 50%, #ffeaa7 100%)',
      ...flex('center', 'column'),
      justifyContent: 'center',
      padding: 24
    }}>

    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}
      <div style={{
        background: C.white,
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: 440,
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '48px 32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            margin: '0 auto 24px',
            ...flex('center'),
            justifyContent: 'center'
          }}>
            <UserCheck size={40} color={C.white} />
          </div>

          <h1 style={{ 
            ...txt(28, 700, C.white), 
            marginBottom: 8 
          }}>
            UNIJOB Internal
          </h1>
          <p style={{ 
            ...txt(15, 400, C.white), 
            opacity: 0.95 
          }}>
            UNIJOB Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              ...txt(14, 600), 
              display: 'block', 
              marginBottom: 8 
            }}>
              Tên đăng nhập
            </label>
            <div style={{
              position: 'relative',
              ...flex('center')
            }}>
              <div style={{
                position: 'absolute',
                left: 14,
                ...flex('center')
              }}>
                <User size={18} color={C.gray} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 44px',
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ 
              ...txt(14, 600), 
              display: 'block', 
              marginBottom: 8 
            }}>
              Mật khẩu
            </label>
            <div style={{
              position: 'relative',
              ...flex('center')
            }}>
              <div style={{
                position: 'absolute',
                left: 14,
                ...flex('center')
              }}>
                <Lock size={18} color={C.gray} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 44px',
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  ...flex('center')
                }}
              >
                {showPassword ? (
                  <Eye size={18} color={C.gray} />
                ) : (
                  <EyeOff size={18} color={C.gray} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: C.white,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
          >
            Đăng nhập
          </button>
        </form>
      </div>

      <p style={{ 
        ...txt(13, 400, C.black), 
        marginTop: 24,
        opacity: 0.9
      }}>
        © 2026 UNIJOB. All rights reserved.
      </p>

      <style>{`
        input:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        input::placeholder {
          color: ${C.grayLight};
        }
        button[type="submit"]:active {
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
}