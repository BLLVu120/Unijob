/*
 * Bảng màu Unijob — hiện đại, màu chính tím.
 * Giữ nguyên tên khóa cũ để mọi trang dùng chung; "blue" giờ cũng là màu chính
 * để giao diện chỉ còn một màu nhấn.
 */
const PRIMARY = '#6d5dfc';
const PRIMARY_DARK = '#5443e8';
const PRIMARY_DEEPER = '#4334c9';
const PRIMARY_SOFT = '#f1efff';
const PRIMARY_BORDER = '#d6d0fe';

export const COLORS = {
  // Chữ / nền tối
  navy: '#0f172a',
  navyDark: '#0b1022',
  darkGray: '#334155',

  // Màu chính (tím)
  purple: PRIMARY,
  purpleLight: '#a79cfe',
  purpleDark: PRIMARY_DEEPER,
  purpleGradient: '#8f82ff',
  blue: PRIMARY,
  blueText: PRIMARY_DARK,
  blueLight: PRIMARY_SOFT,
  blueBubble: PRIMARY,
  blueBorder: PRIMARY_BORDER,

  // Trung tính
  gray: '#64748b',
  grayLight: '#94a3b8',
  grayMid: '#94a3b8',
  grayCard: '#f8f9fc',
  grayBg: '#f5f6fb',
  border: '#e6e8f0',
  fieldBorder: '#cfd5e1', // viền ô nhập / lọc (đậm hơn viền thẻ)
  white: '#ffffff',
  offWhite: '#f8f9fc',

  // Trạng thái
  green: '#15a05a',
  greenBg: '#e8f8ef',
  greenBorder: '#9fe3bd',
  red: '#e5484d',
  redBg: '#fef1f1',
  orange: '#f97316',
  orangeBg: '#fff6ed',
  orangeLight: '#ffedd5',
  orangeDark: '#ea580c',
  yellow: '#fff8e6',
  yellowBg: '#fff6e0',
  yellowBorder: '#fcd77d',
  brown: '#92400e',
  amber: '#f59e0b',
  amberDark: '#b45309',
  amberBg: '#fef3c7',
  amberBorder: '#fde68a',
  redDark: '#dc2626',
  redBorder: '#fecaca',
  greenDark: '#047857',
  info: '#2563eb',
  redBorderStrong: '#fca5a5',
  amberBorderStrong: '#fcd34d',
  cyanBorder: '#a5e7f5',
  violetBorder: '#c9c1fe',
  orangeBorder: '#fdc89a',

  // Phụ
  cyan: '#0ea5e9'
};

// Bo góc, đổ bóng dùng chung
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20 };
export const SHADOW = {
  sm: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
  md: '0 4px 16px rgba(15, 23, 42, 0.06)',
  lg: '0 12px 40px rgba(15, 23, 42, 0.10)',
  primary: '0 6px 20px rgba(109, 93, 252, 0.28)'
};

export const GRADIENT = {
  hero: 'linear-gradient(135deg, #4334c9 0%, #6d5dfc 55%, #9a8cff 100%)',
  primary: 'linear-gradient(135deg, #6d5dfc 0%, #8f82ff 100%)',
  purple: 'linear-gradient(135deg, #6d5dfc 0%, #9a8cff 100%)',
  heroTall: 'linear-gradient(150deg, #4334c9 0%, #6d5dfc 55%, #9a8cff 100%)',
  dark: 'linear-gradient(150deg, #1e1b4b 0%, #4334c9 60%, #6d5dfc 100%)',
  success: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
  danger: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
  dangerDeep: 'linear-gradient(135deg, #be123c 0%, #e5484d 55%, #fb7185 100%)',
  warning: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
  cyan: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
  highlight: 'linear-gradient(90deg, #fde68a 0%, #f9a8d4 100%)',
  // Nền tối xanh than (khác tông tím của GRADIENT.dark)
  night: 'linear-gradient(160deg, #1c2541 0%, #233a6e 55%, #2b55a8 100%)'
};

// Màu gradient cho các ô thông tin ở trang hồ sơ (theo thứ tự)
export const TILE_GRADIENTS = [
  'linear-gradient(135deg, #6d5dfc 0%, #9a8cff 100%)',
  'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
  'linear-gradient(135deg, #0891b2 0%, #22d3ee 100%)',
  'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
  'linear-gradient(135deg, #059669 0%, #34d399 100%)'
];

// Bảng màu nền tối (thanh bên quản trị, chân trang)
export const DARK = {
  bg: '#0f1223',
  text: '#a9b0c9',
  muted: '#8a91ad',
  label: '#5b6383',
  active: '#b3a9ff',
  danger: '#ff8a8e',
  footerText: '#a1a8c3',
  footerMuted: '#7c84a3'
};
