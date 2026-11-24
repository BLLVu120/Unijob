import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  User, Building2, ShieldCheck, FileCheck, Mail, Lock, Eye, EyeOff
} from 'lucide-react';
import { COLORS } from '../constants/colors';
import { login, UnverifiedAccountError } from '../services/authService';
import AuthHero from '../components/AuthHero';
import FormError from '../components/FormError';

// Các vai trò đăng nhập (admin / kiểm duyệt viên dùng chung trang này)
const ROLES = [
  { key: 'candidate', icon: User, title: 'Ứng viên', subtitle: 'Tìm việc làm' },
  { key: 'employer', icon: Building2, title: 'Nhà tuyển dụng', subtitle: 'Đăng tin tuyển' },
  { key: 'admin', icon: ShieldCheck, title: 'Quản trị viên', subtitle: 'Quản lý hệ thống' },
  { key: 'moderator', icon: FileCheck, title: 'Kiểm duyệt viên', subtitle: 'Duyệt tin tuyển' }
];

const REDIRECT_MAP = {
  candidate: '/candidate/profile',
  employer: '/employer/company-profile',
  admin: '/internal/admin/users',
  moderator: '/internal/moderator/job-approval'
};

// Tài khoản nội bộ cố định (BE chưa có API đăng nhập cho admin / kiểm duyệt viên)
const INTERNAL_ACCOUNTS = {
  'admin@gmail.com': { name: 'Admin System', password: '123456', role: 'admin' },
  'moderator@gmail.com': { name: 'Moderator', password: '123456', role: 'moderator' }
};

const loginInternal = (role, email, password) => {
  const account = INTERNAL_ACCOUNTS[email.trim().toLowerCase()];
  if (!account || account.password !== password || account.role !== role) {
    throw new Error('Sai email hoặc mật khẩu');
  }
  const session = { name: account.name, role: account.role, email: email.trim().toLowerCase() };
  localStorage.setItem('user', JSON.stringify(session));
  return session;
};

const submitLogin = async ({ role, email, password, setUser, setErrors, setLoading, navigate }) => {
  setLoading(true);
  setErrors({});
  try {
    const loggedUser = role === 'admin' || role === 'moderator'
      ? loginInternal(role, email, password)
      : await login(role, email, password);
    setUser(loggedUser);
    navigate(REDIRECT_MAP[role]);
  } catch (err) {
    if (err instanceof UnverifiedAccountError) {
      navigate('/verify-email');
      return;
    }
    setErrors({ form: err.message });
  } finally {
    setLoading(false);
  }
};

// Thẻ chọn vai trò: lưới 2 x 2, nội dung mỗi thẻ nằm ngang (icon trái, chữ phải)
const RoleSelector = ({ selectedRole, onRoleChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
    {ROLES.map(({ key, icon: Icon, title, subtitle }) => {
      const active = selectedRole === key;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onRoleChange(key)}
          style={{
            padding: '12px',
            borderRadius: '14px',
            border: `2px solid ${active ? COLORS.purple : COLORS.border}`,
            background: active ? COLORS.blueLight : COLORS.white,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'left',
            minWidth: 0
          }}
        >
          <span style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: active ? COLORS.purple : COLORS.grayBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
          }}>
            <Icon size={18} color={active ? COLORS.white : COLORS.navy} strokeWidth={2} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: COLORS.navy, whiteSpace: 'nowrap' }}>{title}</span>
            <span style={{ display: 'block', fontSize: '12px', color: COLORS.gray, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</span>
          </span>
        </button>
      );
    })}
  </div>
);

const inputStyle = (padRight) => ({
  width: '100%',
  padding: `12px ${padRight}px 12px 44px`,
  borderRadius: '10px',
  border: `1px solid ${COLORS.border}`,
  fontSize: '14px',
  color: COLORS.navy,
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
});

const FieldError = ({ message }) => message ? (
  <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '8px' }}>{message}</div>
) : null;

// Form đăng nhập dùng chung cho mọi vai trò
const LoginForm = ({ role, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email không được để trống';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    else if (role === 'candidate' && password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    submitLogin({ role, email, password, setUser, setErrors, setLoading, navigate });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <FormError message={errors.form} />
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: COLORS.navy, marginBottom: '8px' }}>
          E-mail
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Mail size={18} color={COLORS.gray} style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            style={inputStyle(12)}
          />
        </div>
        <FieldError message={errors.email} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: COLORS.navy, marginBottom: '8px' }}>
          Mật khẩu
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Lock size={18} color={COLORS.gray} style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            style={inputStyle(44)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: '14px', background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center'
            }}
          >
            {showPassword ? <Eye size={18} color={COLORS.gray} /> : <EyeOff size={18} color={COLORS.gray} />}
          </button>
        </div>
        <FieldError message={errors.password} />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '10px',
          border: 'none',
          background: COLORS.purple,
          color: COLORS.white,
          fontSize: '15px',
          fontWeight: '600',
          cursor: loading ? 'wait' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: '0 6px 20px rgba(109, 93, 252, 0.28)'
        }}
      >
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
};

const Login = ({ setUser }) => {
  // ?role=employer (từ nút ở trang chủ) → chọn sẵn vai trò
  const [searchParams] = useSearchParams();
  const [selectedRole, setSelectedRole] = useState(() => {
    const r = searchParams.get('role');
    return ['candidate', 'employer', 'admin', 'moderator'].includes(r) ? r : 'candidate';
  });


  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      background: COLORS.grayBg
    }}>

      <main style={{
        display: 'flex',
        minHeight: 'calc(100vh - 76px)',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 48px 64px',
        gap: '40px',
        alignItems: 'flex-start'
      }}>
        <AuthHero role={['candidate', 'employer'].includes(selectedRole) ? selectedRole : 'internal'} />

        <div style={{
          flex: '0 0 480px',
          background: COLORS.white,
          borderRadius: '20px',
          padding: '40px',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: COLORS.navy,
            marginBottom: '8px'
          }}>
            Đăng nhập
          </h2>

          <p style={{
            fontSize: '14px',
            color: COLORS.gray,
            marginBottom: '32px'
          }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{
              color: COLORS.blue,
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Đăng ký ngay
            </Link>
          </p>

          <RoleSelector
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '24px 0',
            fontSize: '13px',
            color: COLORS.grayLight
          }}>
            {/* Chỉ còn đường kẻ phân cách, không chữ */}
            <div style={{ flex: 1, height: '1px', background: COLORS.border }} />
          </div>

          {/* key: đổi vai trò thì làm mới form */}
          <LoginForm key={selectedRole} role={selectedRole} setUser={setUser} />
        </div>
      </main>
    </div>
  );
};

export default Login;