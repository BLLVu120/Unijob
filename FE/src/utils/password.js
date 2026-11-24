import { COLORS } from '../constants/colors';

// Yêu cầu mật khẩu dùng chung (đăng ký, đổi mật khẩu)
export const PASSWORD_RULES = [
  { text: 'Tối thiểu 8 ký tự', test: p => p.length >= 8 },
  { text: 'Có ít nhất 1 chữ hoa', test: p => /[A-Z]/.test(p) },
  { text: 'Có ít nhất 1 chữ thường', test: p => /[a-z]/.test(p) },
  { text: 'Có ít nhất 1 số', test: p => /\d/.test(p) },
  { text: 'Có ít nhất 1 ký tự đặc biệt', test: p => /[^A-Za-z0-9]/.test(p) }
];

// Mức độ theo số yêu cầu đã đạt (0..5)
const LEVELS = [
  { label: 'Rất yếu', color: COLORS.red },
  { label: 'Rất yếu', color: COLORS.red },
  { label: 'Yếu', color: COLORS.orange },
  { label: 'Trung bình', color: '#eab308' },
  { label: 'Khá', color: '#22c55e' },
  { label: 'Mạnh', color: COLORS.green }
];

export const getPasswordStrength = (password = '') => {
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  return { passed, ...LEVELS[passed] };
};

// Yêu cầu đầu tiên chưa đạt (để báo lỗi), hoặc null nếu đạt hết
export const firstFailedRule = (password = '') => PASSWORD_RULES.find(r => !r.test(password)) || null;
