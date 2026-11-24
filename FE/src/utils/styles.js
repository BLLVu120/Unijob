import { COLORS, RADIUS, SHADOW } from '../constants/colors';

const C = COLORS;

export const flex = (align = 'center', dir = 'row') => ({
  display: 'flex',
  alignItems: align,
  flexDirection: dir
});

export const txt = (size, weight = 400, color = C.navy) => ({
  fontSize: `${size}px`,
  fontWeight: weight,
  color,
  margin: 0,
  lineHeight: 1.5,
  letterSpacing: size >= 24 ? '-0.02em' : size >= 18 ? '-0.01em' : 'normal'
});

// Khung thẻ trắng dùng chung
export const card = (extra = {}) => ({
  background: C.white,
  borderRadius: RADIUS.lg,
  border: `1px solid ${C.border}`,
  boxShadow: SHADOW.sm,
  ...extra
});

// Ô tìm kiếm / lọc / chọn ngày: nền trắng, viền đậm hơn viền thẻ
export const field = (extra = {}) => ({
  height: 44,
  padding: '0 14px',
  borderRadius: 12,
  background: C.white,
  border: `1px solid ${C.fieldBorder}`,
  ...extra
});
