import { useLocation, useNavigate } from 'react-router-dom';
import { COLORS, GRADIENT } from '../constants/colors';
import { EMPLOYER_MENU, CANDIDATE_MENU } from '../constants/menus';
import { getInitials } from '../utils/textUtils';
import { getCurrentUser } from '../services/authService';

const C = COLORS;

// Thanh bên của khu vực ứng viên / nhà tuyển dụng (nằm dưới Navbar)
const Sidebar = ({ isEmployer }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = getCurrentUser();
  const nav = isEmployer ? EMPLOYER_MENU : CANDIDATE_MENU;

  return (
    <aside style={{
      width: 248,
      flexShrink: 0,
      background: C.white,
      borderRight: `1px solid ${C.border}`,
      position: 'sticky',
      top: 64,
      height: 'calc(100vh - 64px)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px'
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.grayLight, letterSpacing: '.08em', padding: '0 12px 8px' }}>
        QUẢN LÝ
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(item => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
                background: isActive ? C.blueLight : 'transparent', cursor: 'pointer', transition: 'background .15s ease'
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.grayBg; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={18} color={isActive ? C.purple : C.gray} />
              <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 500, color: isActive ? C.purple : C.darkGray }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Thẻ người dùng nằm sát đáy thanh bên */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
        marginTop: 'auto', borderRadius: 14, background: C.grayBg
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: GRADIENT.primary, color: C.white, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14
        }}>
          {getInitials(user?.name)}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </p>
          <p style={{ fontSize: 12, color: C.gray }}>{isEmployer ? 'Nhà tuyển dụng' : 'Ứng viên'}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
