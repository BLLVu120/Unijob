import { COLORS, GRADIENT, SHADOW } from '../constants/colors';

const C = COLORS;

/**
 * Header dùng chung cho các trang quản lý: thẻ trắng, viền tím đậm bên trái,
 * logo Unijob in chìm ở góc phải.
 * - title / subtitle: tiêu đề và mô tả ngắn
 * - note: nội dung phụ dưới mô tả (thông báo thành công / lỗi...)
 * - children: các nút hành động, đặt bên phải
 */
export default function PageHeader({ title, subtitle, note, children, style }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', marginBottom: 28,
      background: C.white, border: `1px solid ${C.border}`, borderLeft: `6px solid ${C.purple}`,
      borderRadius: 18, boxShadow: SHADOW.sm, padding: '26px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
      ...style
    }}>
      {/* Logo in chìm: ô "U" gradient rất nhạt, nghiêng nhẹ, tràn khỏi mép phải */}
      <div aria-hidden style={{
        position: 'absolute', right: -28, top: '50%', transform: 'translateY(-50%) rotate(-12deg)',
        width: 150, height: 150, borderRadius: 40, background: GRADIENT.primary, opacity: 0.08,
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
      }}>
        <span style={{ fontSize: 96, fontWeight: 900, color: C.white, lineHeight: 1 }}>U</span>
      </div>

      <div style={{ position: 'relative', minWidth: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.navy, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 15, color: C.gray, marginTop: 6 }}>{subtitle}</p>
        )}
        {note && <div style={{ marginTop: 10 }}>{note}</div>}
      </div>

      {children && (
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
}
