import { Link } from 'react-router-dom';
import { COLORS, DARK } from '../constants/colors';
import Logo from './Logo';

const C = COLORS;

const COLUMNS = [
  {
    title: 'Dành cho ứng viên',
    links: [
      { label: 'Tìm việc làm', to: '/jobs' },
      { label: 'Danh sách công ty', to: '/company' },
      { label: 'Tạo tài khoản', to: '/register' }
    ]
  },
  {
    title: 'Dành cho nhà tuyển dụng',
    links: [
      { label: 'Đăng tin tuyển dụng', to: '/employer/jobs' },
      { label: 'Gói dịch vụ', to: '/employer/subscription' },
      { label: 'Xác thực doanh nghiệp', to: '/employer/verification' }
    ]
  },
  {
    title: 'Về Unijob',
    links: [
      { label: 'Giới thiệu', to: '/' },
      { label: 'Điều khoản sử dụng', to: '/' },
      { label: 'Chính sách bảo mật', to: '/' }
    ]
  }
];

const Footer = () => (
  <footer style={{
    background: C.navyDark,
    padding: '56px 40px 28px',
    color: C.white,
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif"
  }}>
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1.4fr repeat(3, 1fr)',
      gap: 48,
      marginBottom: 40
    }}>
      <div>
        <Logo dark />
        <p style={{ fontSize: 14, lineHeight: 1.7, color: DARK.footerText, marginTop: 16, maxWidth: 320 }}>
          Nền tảng tìm việc part-time an toàn cho sinh viên — kết nối với nhà tuyển dụng đã được xác thực.
        </p>
      </div>
      {COLUMNS.map(col => (
        <div key={col.title}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: C.white }}>{col.title}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {col.links.map(link => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  style={{ color: DARK.footerText, textDecoration: 'none', fontSize: 14 }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.white; }}
                  onMouseLeave={e => { e.currentTarget.style.color = DARK.footerText; }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      paddingTop: 24,
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      fontSize: 13,
      color: DARK.footerMuted
    }}>
      <span>© {new Date().getFullYear()} Unijob. Bảo lưu mọi quyền.</span>
      <span>Dự án EXE201</span>
    </div>
  </footer>
);

export default Footer;
