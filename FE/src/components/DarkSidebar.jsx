import { Users, Building2, FileCheck, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { COLORS, GRADIENT, DARK } from '../constants/colors';
import Logo from './Logo';
const C = COLORS;

// Thanh bên tối cho khu vực quản trị (admin / moderator)
const DarkSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role;
  const isAdmin = role === 'admin';

  const nav = isAdmin
    ? [
        { icon: Users, label: 'Người dùng', path: '/internal/admin/users' },
        { icon: Building2, label: 'Doanh nghiệp', path: '/internal/admin/companies' }
      ]
    : [
        { icon: FileCheck, label: 'Duyệt tin tuyển dụng', path: '/internal/moderator/job-approval' }
      ];

  const logout = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: 240,
      background: DARK.bg,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '22px 14px',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      zIndex: 50
    }}>
      <div style={{ padding: '0 8px 28px' }}>
        <Logo to={isAdmin ? '/internal/admin/users' : '/internal/moderator/job-approval'} dark subtitle={isAdmin ? 'Admin Panel' : 'Moderator Panel'} />
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, color: DARK.label, letterSpacing: '.08em', padding: '0 12px 8px' }}>
        QUẢN TRỊ
      </p>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(({ icon: Icon, label, path }) => {
          const active = pathname.startsWith(path);
          return (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10,
                background: active ? 'rgba(109, 93, 252, 0.18)' : 'transparent', cursor: 'pointer',
                transition: 'background .15s ease'
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={18} color={active ? DARK.active : DARK.muted} />
              <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? C.white : DARK.text }}>
                {label}
              </span>
            </div>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
        {/* Thẻ người dùng — cùng kiểu thẻ ở thanh bên ứng viên / nhà tuyển dụng, tông tối */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 12,
          borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: GRADIENT.primary, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 700, fontSize: 13
          }}>
            {isAdmin ? 'AD' : 'MD'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.white }}>{user?.name || (isAdmin ? 'Admin' : 'Moderator')}</p>
            <p style={{ fontSize: 12, color: DARK.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(229, 72, 77, 0.45)',
            background: 'rgba(229, 72, 77, 0.14)', color: DARK.danger, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default DarkSidebar;
