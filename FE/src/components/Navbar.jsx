import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { User, Bookmark, Send, MessageSquare, Lock, Building2, FileText, Users, CreditCard, Receipt, ShieldCheck }
from 'lucide-react';
import { COLORS } from '../constants/colors';
import { useAuth } from "../context/AuthContext";

const DropdownMenu = ({ user, isEmployer, onLogout, onClose }) => {
  const navigate = useNavigate();
  const employerMenuItems = [
    { icon: Building2, label: 'Hồ sơ công ty', path: '/employer/company-profile' },
    { icon: FileText, label: 'Tin tuyển dụng', path: '/employer/jobs' },
    { icon: Users, label: 'Ứng viên', path: '/employer/candidates' },
    { icon: MessageSquare, label: 'Tin nhắn', badge: 3, path: '/messages' },
    { icon: CreditCard, label: 'Đăng kí gói', path: '/packages' },
    { icon: Receipt, label: 'Lịch sử giao dịch', path: '/transactions' },
    { icon: ShieldCheck, label: 'Xác thực', path: '/verification' }
  ];

  const userMenuItems = [
    { icon: User, label: 'Hồ sơ cá nhân', path: '/candidate/profile' },
    { icon: Bookmark, label: 'Việc đã lưu', path: '/candidate/saved-jobs' },
    { icon: Send, label: 'Việc đã ứng tuyển', path: '/candidate/applied-jobs' },
    { icon: MessageSquare, label: 'Tin nhắn', badge: 3, path: '/candidate/messages' },
    { icon: Lock, label: 'Đổi mật khẩu', path: '/candidate/change-password' }
  ];

  const menuItems = isEmployer ? employerMenuItems : userMenuItems;

  const handleItemClick = (item) => {
    navigate(item.path);
    onClose();
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '60px',
        right: '0',
        width: '280px',
        background: COLORS.white,
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        zIndex: 1,
        animation: 'slideDown 0.2s ease-out'
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.lightOrange} 100%)`,
          padding: '20px',
          color: COLORS.white
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '600',
              border: '2px solid rgba(255, 255, 255, 0.5)'
            }}
          >
            CH
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {user.email}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '8px 0' }}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              onClick={() => handleItemClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={18} color={COLORS.gray} />

              <span
                style={{
                  color: COLORS.darkGray,
                  fontSize: '14px',
                  fontWeight: '500',
                  flex: 1
                }}
              >
                {item.label}
              </span>

              {item.badge && (
                <span
                  style={{
                    background: COLORS.red,
                    color: COLORS.white,
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0' }}>
        <button
          onClick={() => {
            onLogout();
            navigate("/");
            onClose();
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: COLORS.red,
            color: COLORS.white,
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dc2626';
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = COLORS.red;
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = !!user;
  const isEmployer = user?.role === "employer";
  const userData = user;

  return (
    <nav
      style={{
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: COLORS.navy,
        height: '64px',
        padding: '0 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: COLORS.white,
              letterSpacing: "0.5px",
              cursor: "pointer"
            }}
          >
            UNIJOB
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {['Tìm việc', 'Nhà tuyển dụng'].map((item, idx) => (
            <span
              key={idx}
              style={{
                color: COLORS.white,
                fontSize: '14px',
                fontWeight: '500',
                opacity: 0.9,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.9')}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {isLoggedIn ? (
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              height: '50px',
              padding: '0 16px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${COLORS.orange} 0%, ${COLORS.lightOrange} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: COLORS.white
              }}
            >
              CH
            </div>
            <div
              style={{
                textAlign: 'left',
                lineHeight: '1.1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  color: COLORS.white,
                  fontSize: '14px',
                  fontWeight: '600',
                  lineHeight: '1.2'
                }}
              >
                {userData?.name}
              </div>
              <div
                style={{
                  color: COLORS.gray,
                  fontSize: '11px',
                  fontWeight: '500',
                  lineHeight: '1.2',
                  marginTop: '3px',
                  opacity: 0.8
                }}
              >
                {userData?.roleName}
              </div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                transition: 'transform 0.2s ease',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke={COLORS.white}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {isDropdownOpen && (
            <DropdownMenu
              user={user}
              isEmployer={isEmployer}
              onLogout={logoutUser}
              onClose={() => setIsDropdownOpen(false)}
            />
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: `1px solid ${COLORS.white}`,
              background: 'transparent',
              color: COLORS.white,
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Đăng ký
          </button>

          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: 'none',
              background: COLORS.orange,
              color: COLORS.white,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(251, 146, 60, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 146, 60, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(251, 146, 60, 0.3)';
            }}
          >
            Đăng nhập
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;