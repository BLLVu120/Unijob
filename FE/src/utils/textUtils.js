// Chữ viết tắt cho avatar.
//  from = 'end'  : 2 từ cuối — hợp với tên người (Trần Thu Hà → TH)
//  from = 'start': 2 từ đầu — hợp với tên công ty (Unijob Studio → US)
export const getInitials = (name, from = 'end') => {
  const words = (name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const picked = from === 'start' ? words.slice(0, 2) : words.slice(-2);
  return picked.map(w => w[0]).join('').toUpperCase();
};

// Ngày theo kiểu Việt Nam (25/11/2026); không có giá trị thì trả fallback
export const formatDate = (value, fallback = '') =>
  value ? new Date(value).toLocaleDateString('vi-VN') : fallback;

// Ngày giờ ngắn gọn (09:00 25/11/26)
export const formatDateTime = (value, fallback = '') =>
  value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : fallback;

// Số theo kiểu Việt Nam (1.234.567)
const NUMBER_FORMAT = new Intl.NumberFormat('vi-VN');
export const formatNumber = (value) => NUMBER_FORMAT.format(value);
