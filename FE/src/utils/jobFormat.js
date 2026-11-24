import {
  Briefcase, Coffee, GraduationCap, ShoppingCart, Palette, Code, Truck, Users, Megaphone
} from 'lucide-react';
import { API_BASE } from '../api/api';
import { formatNumber } from './textUtils';


export const formatSalary = (min, max) => {
  if (min && max) return `${formatNumber(min)} - ${formatNumber(max)} VNĐ`;
  if (min) return `Từ ${formatNumber(min)} VNĐ`;
  if (max) return `Đến ${formatNumber(max)} VNĐ`;
  return 'Thỏa thuận';
};

export const formatExperience = (years) =>
  !years ? 'Không yêu cầu' : `${years} năm kinh nghiệm`;

export const JOB_TYPE_LABELS = {
  remote: 'Từ xa',
  offline: 'Tại văn phòng',
  hybrid: 'Kết hợp'
};

export const timeAgo = (value) => {
  if (!value) return '';
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(value).toLocaleDateString('vi-VN');
};

// Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu
export const normalize = (s) =>
  (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');

// Nhóm ngành ↔ từ khóa (dùng cho bộ lọc và chọn icon)
export const INDUSTRIES = {
  fnb: { label: 'F&B', icon: Coffee, keywords: ['phuc vu', 'pha che', 'barista', 'cafe', 'coffee', 'nha hang', 'bep', 'f&b'] },
  retail: { label: 'Bán hàng', icon: ShoppingCart, keywords: ['ban hang', 'thu ngan', 'sales', 'cua hang', 'sieu thi', 'retail'] },
  education: { label: 'Giáo dục', icon: GraduationCap, keywords: ['gia su', 'giao vien', 'tro giang', 'day ', 'tutor', 'giao duc'] },
  tech: { label: 'Công nghệ', icon: Code, keywords: ['developer', 'lap trinh', 'it ', 'cong nghe', 'tester', 'frontend', 'backend', 'data'] },
  design: { label: 'Thiết kế', icon: Palette, keywords: ['design', 'thiet ke', 'graphic', 'ui', 'ux'] },
  marketing: { label: 'Marketing', icon: Megaphone, keywords: ['marketing', 'content', 'seo', 'truyen thong', 'quang cao'] },
  delivery: { label: 'Giao hàng', icon: Truck, keywords: ['giao hang', 'shipper', 'tai xe', 'van chuyen'] },
  office: { label: 'Hành chính - Văn phòng', icon: Users, keywords: ['hanh chinh', 'van phong', 'nhan su', 'ke toan', 'cskh', 'le tan'] }
};

// Chỉ xét tiêu đề + vị trí (mô tả dài dễ khớp nhầm từ khóa)
const jobText = (job) => ` ${normalize(`${job.title} ${job.role}`)} `;

export const matchesIndustry = (job, key) =>
  !key || INDUSTRIES[key]?.keywords.some(k => jobText(job).includes(k));

export const jobIcon = (job) => {
  const found = Object.values(INDUSTRIES).find(ind => ind.keywords.some(k => jobText(job).includes(k)));
  return found ? found.icon : Briefcase;
};

// Địa điểm trong bộ lọc ↔ các cách viết thường gặp
export const LOCATIONS = {
  hanoi: { label: 'Hà Nội', keywords: ['ha noi', 'hn'] },
  hcm: { label: 'TP. Hồ Chí Minh', keywords: ['ho chi minh', 'hcm', 'sai gon', 'tp.hcm'] },
  danang: { label: 'Đà Nẵng', keywords: ['da nang'] },
  remote: { label: 'Online / Từ xa', keywords: ['online', 'remote', 'tu xa'] }
};

export const matchesLocation = (job, key) => {
  if (!key) return true;
  if (key === 'remote' && job.job_type === 'remote') return true;
  const loc = normalize(job.location);
  return LOCATIONS[key]?.keywords.some(k => loc.includes(k));
};

// Tin còn hiển thị công khai: đang mở và chưa hết hạn
export const isJobOpen = (job) => {
  if (job.is_active === false) return false;
  if (job.expiry_date && new Date(job.expiry_date) < new Date(new Date().toDateString())) return false;
  return true;
};

// Tin đã lưu: giữ trong trình duyệt (BE chưa có API lưu tin)
const SAVED_KEY = 'savedJobs';
export const readSavedJobs = () => {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch { return []; }
};
export const toggleSavedJob = (id) => {
  const list = readSavedJobs();
  const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next.includes(id);
};

// Đường dẫn CV lưu trong DB có thể là tương đối (/cv/x.pdf) hoặc đầy đủ (http...)
export const cvLink = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API_BASE + url.replace('/src/store/cv', '/cv');
};
