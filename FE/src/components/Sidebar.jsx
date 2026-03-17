import {
  User, FileText, Bookmark, Send,
  MessageSquare, Lock,
  Building2, Users, CreditCard, Receipt, ShieldCheck
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { flex, txt } from '../utils/styles';
import { COLORS } from '../constants/colors';

const C = COLORS;

const Sidebar = ({ isEmployer }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const employerNav = [
    { icon: Building2, label: 'Hồ sơ công ty', path: '/employer/company-profile' },
    { icon: FileText, label: 'Tin tuyển dụng', path: '/employer/jobs' },
    { icon: Users, label: 'Ứng viên', path: '/employer/candidates' },
    { icon: MessageSquare, label: 'Tin nhắn', path: '/employer/messages' },
    { icon: CreditCard, label: 'Đăng kí gói', path: '/employer/subscription' },
    { icon: Receipt, label: 'Lịch sử giao dịch', path: '/employer/transactions' },
    { icon: ShieldCheck, label: 'Xác thực', path: '/employer/verification' }
  ];

  const userNav = [
    { icon: User, label: 'Hồ sơ cá nhân', path: '/candidate/profile' },
    { icon: Bookmark, label: 'Việc đã lưu', path: '/candidate/saved-jobs' },
    { icon: Send, label: 'Việc đã ứng tuyển', path: '/candidate/applied-jobs' },
    { icon: MessageSquare, label: 'Tin nhắn', path: '/candidate/messages' },
    { icon: Lock, label: 'Đổi mật khẩu', path: '/candidate/change-password' }
  ];

  const nav = isEmployer ? employerNav : userNav;

  return (
    <aside style={{
      width: 220,
      background: C.white,
      borderRight: `1px solid ${C.border}`,
      minHeight: '100%',
      ...flex('flex-start', 'column'),
      padding: '24px 0'
    }}>
      <div style={{ padding: '0 24px 24px' }}>
        <h1 style={{ ...txt(22, 700, C.blue), marginBottom: 4 }}>UNIJOB</h1>
        <p style={{ ...txt(12, 500, C.gray) }}>
          {isEmployer ? 'Employer Panel' : 'Candidate Panel'}
        </p>
      </div>

      <nav style={{ flex: 1, width: '100%' }}>
        {nav.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);

          return (
            <div
              key={i}
              onClick={() => navigate(item.path)}
              style={{
                ...flex('center'),
                gap: 12,
                padding: '12px 24px',
                background: isActive ? C.blueLight : 'transparent',
                borderRight: isActive ? `3px solid ${C.blue}` : '3px solid transparent',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} color={isActive ? C.blue : C.gray} />
              <span style={{ ...txt(14, 500, isActive ? C.blue : C.navy) }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
