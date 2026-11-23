import { COLORS } from "../constants/colors";

const Footer = () => (
  <footer style={{
    background: COLORS.darkBg,
    padding: '48px 48px 24px',
    color: COLORS.white,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }}>
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '100px',
      marginBottom: '32px'
    }}>
      <div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '16px',
          letterSpacing: '0.5px'
        }}>
          UNIJOB
        </h3>
        <p style={{
          fontSize: '14px',
          lineHeight: '1.6',
          opacity: 0.8,
          margin: 0
        }}>
          Nền tảng tìm việc làm thêm và part-time hàng đầu Việt Nam.<br />
          Kết nối ứng viên với hàng ngàn cơ hội việc làm linh hoạt.
        </p>
      </div>
      <div>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Về chúng tôi
        </h4>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {['Giới thiệu', 'Liên hệ', 'Điều khoản', 'Chính sách'].map((item, idx) => (
            <li key={idx} style={{ marginBottom: '12px' }}>
              <a href="#" style={{
                color: COLORS.white,
                textDecoration: 'none',
                fontSize: '14px',
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          Kết nối
        </h4>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}>
          {['Facebook', 'TikTok'].map((item, idx) => (
            <li key={idx} style={{ marginBottom: '12px' }}>
              <a href="#" style={{
                color: COLORS.white,
                textDecoration: 'none',
                fontSize: '14px',
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div style={{
      textAlign: 'center',
      paddingTop: '24px',
      borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
      fontSize: '13px',
      opacity: 0.6
    }}>
      © 2025 UNIJOB. All rights reserved.
    </div>
  </footer>
);

export default Footer;
