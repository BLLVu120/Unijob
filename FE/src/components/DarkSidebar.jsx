import { Users, Building2, FileCheck, Flag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { COLORS } from '../constants/colors';
import { flex, txt } from '../utils/styles';
const C = COLORS;

const DarkSidebar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const adminNav = [
    { icon: Users, label: 'Người dùng', path: '/internal/admin/users' },
    { icon: Building2, label: 'Doanh nghiệp', path: '/internal/admin/companies' }
  ];

  const moderatorNav = [
    { icon: FileCheck, label: 'Duyệt tin tuyển dụng', path: '/internal/moderator/job-approval' },
    { icon: Flag, label: 'Báo cáo', path: '/internal/moderator/reports' }
  ];

  const nav = role === "admin" ? adminNav : moderatorNav;

  const logout = () => {
    handleLogout();              
    navigate("/internal/login"); 
  };

  return (
    <aside style={{
      width: 220,
      background: C.darkerNavy,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      ...flex('flex-start', 'column'),
      padding: '24px 0'
    }}>
      <div style={{ padding: '0 24px 32px' }}>
        <h1 style={{ ...txt(22, 700, C.white), marginBottom: 4 }}>UNIJOB</h1>
        <p style={{ ...txt(12, 500, C.grayLight) }}>
          {role === "admin" ? "Admin Panel" : "Moderator Panel"}
        </p>
      </div>

      <nav style={{ flex: 1, width: '100%' }}>
        {nav.map(({ icon: Icon, label, path }) => {
          const active = pathname.startsWith(path);
            return (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{
                ...flex('center'),
                gap: 12,
                padding: '14px 24px',
                background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                borderRight: active ? `3px solid ${C.blue}` : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} color={active ? C.blue : C.grayLight} />
              <span style={{ ...txt(14, 500, active ? C.white : C.grayLight) }}>
                {label}
              </span>
            </div>
          );
        })}
      </nav>
      
      <div style={{ width: "100%" }}>
        <div style={{ padding: "14px 24px" }}>
            <div style={{ ...flex('center'), gap: 12 }}>
                <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: C.blue,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                >
                    <span style={{ ...txt(14, 700, C.white) }}>{role === "admin" ? "AD" : "MD"}</span>
                </div>
                <div>
                    <p style={{ ...txt(14, 600, C.white) }}>{role === "admin" ? "Admin User" : "Moderator"}</p>
                    <p style={{ ...txt(12, 400, C.grayLight) }}>{role === "admin" ? "Admin Panel" : "Moderator Panel"}</p>
                </div>
            </div>
        </div>

        <div style={{ padding: "0 24px 14px" }}>
            <button
            onClick={logout}
            style={{
                width: "100%",
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: C.red,
                color: C.white,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer"
            }}
            >
            Đăng xuất
            </button>
        </div>
    </div>
    </aside>
  );
};

export default DarkSidebar;
