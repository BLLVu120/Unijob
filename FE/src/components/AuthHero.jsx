import {
  CheckCircle, Shield, Zap, CreditCard, User, Users, FileCheck, BadgeCheck, BarChart3, Sparkles, ChevronRight
} from 'lucide-react';
import { COLORS, GRADIENT, TILE_GRADIENTS } from '../constants/colors';

const C = COLORS;

// Nội dung banner theo vai trò (dùng chung cho trang Đăng nhập và Đăng ký)
const CONTENT = {
  candidate: {
    badge: 'Dành cho ứng viên',
    title: ['Với ', 'UNIJOB', ', tìm việc part-time dễ dàng hơn bao giờ hết'],
    subtitle: 'Kết nối bạn với hàng ngàn cơ hội việc làm part-time uy tín, phù hợp lịch học.',
    gradient: GRADIENT.heroTall,
    features: [
      { icon: CheckCircle, text: '10.000+ việc làm part-time được xác thực' },
      { icon: Shield, text: 'An toàn với hệ thống xác thực doanh nghiệp' },
      { icon: Zap, text: 'Ứng tuyển nhanh chỉ trong 30 giây' },
      { icon: CreditCard, text: 'Miễn phí hoàn toàn cho ứng viên' }
    ],
    steps: ['Tạo hồ sơ', 'Ứng tuyển', 'Nhận việc']
  },
  employer: {
    badge: 'Dành cho nhà tuyển dụng',
    title: ['Tìm ', 'ứng viên chất lượng', ' cho doanh nghiệp của bạn'],
    subtitle: 'Đăng tin, sàng lọc hồ sơ và hẹn phỏng vấn trên cùng một nền tảng.',
    gradient: GRADIENT.dark,
    features: [
      { icon: User, text: '50.000+ ứng viên sẵn sàng làm việc' },
      { icon: Shield, text: 'Uy tín với hệ thống xác thực hồ sơ' },
      { icon: Zap, text: 'Đăng tin tuyển dụng chỉ trong 5 phút' },
      { icon: CreditCard, text: 'Nhiều gói dịch vụ linh hoạt' }
    ],
    steps: ['Đăng tin', 'Duyệt hồ sơ', 'Phỏng vấn']
  },
  internal: {
    badge: 'Khu vực nội bộ',
    title: ['Khu vực ', 'quản trị', ' Unijob'],
    subtitle: 'Dành cho quản trị viên và kiểm duyệt viên. Vui lòng đăng nhập bằng tài khoản nội bộ.',
    gradient: `linear-gradient(150deg, #0b0e1c 0%, #1e1b4b 55%, ${C.purpleDark} 100%)`,
    features: [
      { icon: Users, text: 'Quản lý tài khoản ứng viên' },
      { icon: BadgeCheck, text: 'Xác thực thông tin doanh nghiệp' },
      { icon: FileCheck, text: 'Kiểm duyệt tin trước khi hiển thị' },
      { icon: BarChart3, text: 'Theo dõi hoạt động hệ thống' }
    ],
    steps: ['Đăng nhập', 'Kiểm duyệt', 'Theo dõi']
  }
};

const GLASS = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.18)'
};

export default function AuthHero({ role }) {
  const content = CONTENT[role] || CONTENT.internal;
  const [before, highlight, after] = content.title;

  return (
    <div style={{
      flex: 1, position: 'sticky', top: 104, overflow: 'hidden', minHeight: 600,
      background: content.gradient, borderRadius: 24, padding: '48px 52px', color: C.white,
      boxShadow: '0 20px 50px rgba(67, 52, 201, 0.25)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center'
    }}>
      {/* Khối trang trí */}
      <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', top: -200, right: -140 }} />
      <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -120, left: -80 }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '22px 22px',
        maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent 70%)',
        WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent 70%)'
      }} />

      <div style={{ position: 'relative' }}>
        <span style={{
          ...GLASS, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999,
          fontSize: 13, fontWeight: 600, marginBottom: 22
        }}>
          <Sparkles size={15} /> {content.badge}
        </span>

        <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.22, letterSpacing: '-0.03em', marginBottom: 16 }}>
          {before}
          <span style={{ background: GRADIENT.highlight, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            {highlight}
          </span>
          {after}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,0.85)', marginBottom: 32, maxWidth: 560 }}>
          {content.subtitle}
        </p>

        {/* Tính năng: lưới 2 × 2, mỗi thẻ một màu icon */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 28 }}>
          {content.features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.text} style={{ ...GLASS, borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: TILE_GRADIENTS[i % TILE_GRADIENTS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(0,0,0,0.18)'
                }}>
                  <Icon size={20} color={C.white} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>{f.text}</span>
              </div>
            );
          })}
        </div>

        {/* Các bước sử dụng */}
        <div style={{ ...GLASS, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {content.steps.map((step, i) => (
            <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: '50%', background: C.white, color: C.purpleDark,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800
                }}>
                  {i + 1}
                </span>
                {step}
              </span>
              {i < content.steps.length - 1 && <ChevronRight size={16} color="rgba(255,255,255,0.6)" />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
