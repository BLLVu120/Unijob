export const API_BASE = import.meta.env.VITE_API_URL || 'https://api.d4f.io.vn';

// Lấy thông báo lỗi dễ đọc từ phản hồi của BE (FastAPI trả nhiều dạng khác nhau)
const extractError = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data.error === 'string') return data.error;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
  return fallback;
};

export const apiRequest = async (endpoint, options = {}) => {
  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error('Không kết nối được máy chủ. Vui lòng thử lại sau.');
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) throw new Error(extractError(data, `Lỗi máy chủ (${res.status})`));

  // BE trả HTTP 200 kèm { status: false, error } khi nghiệp vụ thất bại
  if (data && data.status === false) throw new Error(extractError(data, 'Yêu cầu thất bại'));

  return data;
};
