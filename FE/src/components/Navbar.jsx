import { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { COLORS, GRADIENT, SHADOW } from '../constants/colors';
import { EMPLOYER_MENU, CANDIDATE_MENU } from '../constants/menus';
import { getInitials } from '../utils/textUtils';
import Logo from './Logo';

const C = COLORS;

const DropdownMenu = ({ user, isEmployer, onLogout, onClose }) => {
  const navigate = useNavigate();
  const menuItems = isEmployer ? EMPLOYER_MENU : CANDIDATE_MENU;

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 280,
      background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
      boxShadow: SHADOW.lg, overflow: 'hidden', zIndex: 10,
      animation: 'slideDown 0.18s ease-out'
    }}>
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', background: GRADIENT.primary, color: C.white,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0
        }}>
          {getInitials(user?.name)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 12, color: C.gray, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
        </div>
      </div>

      <div style={{ padding: 6 }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              onClick={() => { navigate(item.path); onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 10, cursor: 'pointer', transition: 'background .15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.grayBg; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={17} color={C.gray} />
              <span style={{ color: C.darkGray, fontSize: 14, fontWeight: 500 }}>{item.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: 6, borderTop: `1px solid ${C.border}` }}>
        <div
          onClick={() => { onLogout(); onClose(); navigate('/'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 10, cursor: 'pointer', color: C.red, fontSize: 14, fontWeight: 600
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.redBg; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={17} /> Đăng xuất
        </div>
      </div>
    </div>
  );
};

const NAV_LINKS = [
  { label: 'Việc làm', to: '/jobs' },
  { label: 'Công ty', to: '/company' }
];

const Navbar = ({ isLoggedIn, isEmployer, userData, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Đóng menu khi bấm ra ngoài
  useEffect(() => {
    if (!isDropdownOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setIsDropdownOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isDropdownOpen]);

  return (
    <nav style={{
      fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      background: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'saturate(180%) blur(12px)',
      WebkitBackdropFilter: 'saturate(180%) blur(12px)',
      borderBottom: `1px solid ${C.border}`,
      height: 64,
      padding: '0 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100 // thấp hơn mọi hộp thoại (≥ 998) để lớp phủ che được navbar
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <Logo />
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                padding: '8px 14px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? C.purple : C.darkGray,
                background: isActive ? C.blueLight : 'transparent'
              })}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      {isLoggedIn ? (
        <div ref={menuRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 10px 0 6px',
              borderRadius: 999, border: `1px solid ${isDropdownOpen ? C.blueBorder : C.border}`,
              background: isDropdownOpen ? C.blueLight : C.white, cursor: 'pointer', transition: 'all .15s ease'
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: GRADIENT.primary, color: C.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700
            }}>
              {getInitials(userData?.name)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, maxWidth: 180 }}>
              <span style={{ color: C.navy, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userData?.name}
              </span>
            </div>
            <ChevronDown
              size={16}
              color={C.gray}
              style={{ transition: 'transform .2s ease', transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}
            />
          </div>

          {isDropdownOpen && (
            <DropdownMenu
              user={userData}
              isEmployer={isEmployer}
              onLogout={onLogout}
              onClose={() => setIsDropdownOpen(false)}
            />
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '9px 18px', borderRadius: 10, border: `1px solid ${C.border}`,
              background: C.white, color: C.navy, fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Đăng ký
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '9px 18px', borderRadius: 10, border: 'none', background: C.purple,
              color: C.white, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: SHADOW.primary
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
