import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Building2, Mail, Lock, Eye, EyeOff, Shield, Zap, CreditCard, CheckCircle } from 'lucide-react';
import { COLORS } from '../constants/colors';

const mockUsers = {
  "candidate@gmail.com": { name: "Nguyễn Văn A", password: "123456", role: "candidate" },
  "employer@gmail.com": { name: "The Coffee House", password: "123456", role: "employer" },
};

const redirectMap = {
  candidate: "/candidate/profile",
  employer: "/employer/company-profile",
};

const RoleSelector = ({ selectedRole, onRoleChange }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '24px'
  }}>
    <button
      onClick={() => onRoleChange('candidate')}
      style={{
        padding: '20px',
        borderRadius: '12px',
        border: selectedRole === 'candidate' ? `2px solid ${COLORS.blue}` : `2px solid ${COLORS.border}`,
        background: selectedRole === 'candidate' ? 'rgba(59, 130, 246, 0.05)' : COLORS.white,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <User size={32} color={selectedRole === 'candidate' ? COLORS.blue : COLORS.navy} strokeWidth={2} />
      <div style={{
        fontSize: '15px',
        fontWeight: '600',
        color: COLORS.navy
      }}>
        Ứng viên
      </div>
      <div style={{
        fontSize: '12px',
        color: COLORS.gray
      }}>
        Tìm việc làm
      </div>
    </button>
    
    <button
      onClick={() => onRoleChange('employer')}
      style={{
        padding: '20px',
        borderRadius: '12px',
        border: selectedRole === 'employer' ? `2px solid ${COLORS.blue}` : `2px solid ${COLORS.border}`,
        background: selectedRole === 'employer' ? 'rgba(59, 130, 246, 0.05)' : COLORS.white,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <Building2 size={32} color={selectedRole === 'employer' ? COLORS.blue : COLORS.navy} strokeWidth={2} />
      <div style={{
        fontSize: '15px',
        fontWeight: '600',
        color: COLORS.navy
      }}>
        Nhà tuyển dụng
      </div>
      <div style={{
        fontSize: '12px',
        color: COLORS.gray
      }}>
        Đăng tín tuyển
      </div>
    </button>
  </div>
);

const CandidateLoginForm = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!email) newErrors.email = 'Email ứng viên không được để trống';
    else if (!/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = 'Email ứng viên không hợp lệ';

    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    else if (password.length < 6)
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const user = mockUsers[email];

    if (!user || user.password !== password) {
      setErrors({ form: "Sai email hoặc mật khẩu" });
      return;
    }

    if (user.role !== "candidate") {
      setErrors({ form: "Tài khoản này không phải ứng viên" });
      return;
    }

    const loggedUser = {
      name: user.name,
      email,
      role: user.role,
      roleName: "Ứng viên"
    };

    localStorage.setItem("user", JSON.stringify(loggedUser));
    setUser(loggedUser);
    navigate(redirectMap[user.role]);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: COLORS.navy,
          marginBottom: '8px'
        }}>
          E-mail
        </label>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Mail size={18} color={COLORS.gray} style={{
            position: 'absolute',
            left: '14px',
            pointerEvents: 'none'
          }} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '14px',
              color: COLORS.navy,
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = COLORS.blue}
            onBlur={e => e.target.style.borderColor = COLORS.border}
          />
        </div>
          {errors.email && (
            <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '10px' }}>
              {errors.email}
            </div>
          )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: COLORS.navy,
          marginBottom: '8px'
        }}>
          Mật khẩu
        </label>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Lock size={18} color={COLORS.gray} style={{
            position: 'absolute',
            left: '14px',
            pointerEvents: 'none'
          }} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            style={{
              width: '100%',
              padding: '12px 44px 12px 44px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '14px',
              color: COLORS.navy,
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = COLORS.blue}
            onBlur={e => e.target.style.borderColor = COLORS.border}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {showPassword ? (
              <EyeOff size={18} color={COLORS.gray} />
            ) : (
              <Eye size={18} color={COLORS.gray} />
            )}
          </button>
        </div>
        {errors.password && (
          <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '10px' }}>
            {errors.password}
          </div>
        )}
      </div>

      <button
        type="submit"
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
          boxShadow: '0 4px 12px rgba(139, 127, 214, 0.3)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 127, 214, 0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 127, 214, 0.3)';
        }}
      >
        Đăng nhập
      </button>
    </form>
  );
};

const EmployerLoginForm = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!email) newErrors.email = 'Email doanh nghiệp không được để trống';
    else if (!/^\S+@\S+\.\S+$/.test(email))
      newErrors.email = 'Email doanh nghiệp không hợp lệ';

    if (!password) newErrors.password = 'Mật khẩu không được để trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const user = mockUsers[email];

    if (!user || user.password !== password) {
      setErrors({ form: "Sai email hoặc mật khẩu" });
      return;
    }

    if (user.role !== "employer") {
      setErrors({ form: "Tài khoản này không phải nhà tuyển dụng" });
      return;
    }

    const loggedUser = {
      name: user.name,
      email,
      role: user.role,
      roleName: "Nhà tuyển dụng"
    };

    localStorage.setItem("user", JSON.stringify(loggedUser));
    setUser(loggedUser);
    navigate(redirectMap[user.role]);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: COLORS.navy,
          marginBottom: '8px'
        }}>
          E-mail
        </label>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Mail size={18} color={COLORS.gray} style={{
            position: 'absolute',
            left: '14px',
            pointerEvents: 'none'
          }} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '14px',
              color: COLORS.navy,
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = COLORS.blue}
            onBlur={e => e.target.style.borderColor = COLORS.border}
          />
        </div>
          {errors.email && (
            <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '10px' }}>
              {errors.email}
            </div>
          )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: COLORS.navy,
          marginBottom: '8px'
        }}>
          Mật khẩu
        </label>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Lock size={18} color={COLORS.gray} style={{
            position: 'absolute',
            left: '14px',
            pointerEvents: 'none'
          }} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            style={{
              width: '100%',
              padding: '12px 44px 12px 44px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '14px',
              color: COLORS.navy,
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = COLORS.blue}
            onBlur={e => e.target.style.borderColor = COLORS.border}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {showPassword ? (
              <EyeOff size={18} color={COLORS.gray} />
            ) : (
              <Eye size={18} color={COLORS.gray} />
            )}
          </button>
        </div>
        {errors.password && (
          <div style={{ fontSize: '12px', color: COLORS.red, marginTop: '10px' }}>
            {errors.password}
          </div>
        )}
      </div>

      <button
        type="submit"
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
          boxShadow: '0 4px 12px rgba(139, 127, 214, 0.3)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 127, 214, 0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 127, 214, 0.3)';
        }}
      >
        Đăng nhập
      </button>
    </form>
  );
};

const FeatureItem = ({ icon: Icon, text }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '20px'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      background: 'rgba(255, 255, 255, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={24} color={COLORS.white} strokeWidth={2} />
    </div>
    <p style={{
      fontSize: '15px',
      lineHeight: '1.6',
      color: COLORS.white,
      margin: 0,
      paddingTop: '12px'
    }}>
      {text}
    </p>
  </div>
);

const LoginPage = ({ setUser }) => {
  const [selectedRole, setSelectedRole] = useState('candidate');

  const candidateFeatures = [
    { icon: CheckCircle, text: '10.000+ việc làm part-time được xác thực' },
    { icon: Shield, text: 'An toàn với hệ thống xác thực doanh nghiệp' },
    { icon: Zap, text: 'Nhanh chóng ứng tuyển chỉ trong 30 giây' },
    { icon: CreditCard, text: 'Miễn phí hoàn toàn cho ứng viên' }
  ];

  const employerFeatures = [
    { icon: User, text: '50.000+ ứng viên sẵn sàng làm việc' },
    { icon: Shield, text: 'Uy tín với hệ thống xác thực hồ sơ ứng viên' },
    { icon: Zap, text: 'Nhanh chóng đăng tin tuyển dụng trong 5 phút' },
    { icon: CreditCard, text: 'Hiệu quả tỷ lệ tìm được ứng viên phù hợp cao' }
  ];

  const features = selectedRole === 'candidate' ? candidateFeatures : employerFeatures;
  const heroTitle = selectedRole === 'candidate' 
    ? 'Với UNIJOB, tìm việc làm part-time trở nên dễ dàng hơn bao giờ hết'
    : 'Tìm kiếm ứng viên chất lượng cho doanh nghiệp của bạn';
  const heroSubtitle = selectedRole === 'candidate'
    ? 'Nền tảng kết nối ứng viên với hàng ngàn cơ hội việc làm part-time uy tín tại Việt Nam.'
    : 'Nền tảng tuyển dụng hàng đầu giúp doanh nghiệp kết nối với hàng ngàn ứng viên tiềm năng.';
  const gradientColor = selectedRole === 'candidate' 
    ? `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.purpleGradient} 100%)`
    : `linear-gradient(135deg, ${COLORS.blue} 0%, ${COLORS.blueGradient} 100%)`;

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
        minHeight: 'calc(100vh - 76px)',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 48px',
        gap: '48px',
        alignItems: 'center'
      }}>
        <div style={{
          flex: '1',
          background: gradientColor,
          borderRadius: '24px',
          padding: '60px',
          color: COLORS.white,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h1 style={{
            fontSize: '40px',
            fontWeight: '700',
            lineHeight: '1.3',
            marginBottom: '20px',
            letterSpacing: '-0.5px'
          }}>
            {heroTitle}
          </h1>
          
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            opacity: 0.95,
            marginBottom: '48px'
          }}>
            {heroSubtitle}
          </p>

          <div>
            {features.map((feature, idx) => (
              <FeatureItem key={idx} {...feature} />
            ))}
          </div>
        </div>

        <div style={{
          flex: '0 0 480px',
          background: COLORS.white,
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
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
            <div style={{ flex: 1, height: '1px', background: COLORS.border }} />
            Hoặc đăng nhập bằng email
            <div style={{ flex: 1, height: '1px', background: COLORS.border }} />
          </div>

          {selectedRole === 'candidate'
            ? <CandidateLoginForm setUser={setUser} />
            : <EmployerLoginForm setUser={setUser} />
          }
        </div>
      </main>
    </div>
  );
};

export default LoginPage;