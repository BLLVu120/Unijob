import { EMPLOYER_MENU, CANDIDATE_MENU } from '../constants/menus';

export const APP_NAME = 'Unijob';
export const HOME_TITLE = 'Unijob - Việc làm part-time cho sinh viên';

// Tiền tố đường dẫn → tên trang (khớp tiền tố dài nhất)
const PAGE_TITLES = {
  '/jobs': 'Việc làm',
  '/job-detail': 'Chi tiết việc làm',
  '/company': 'Công ty',
  '/company-detail': 'Chi tiết công ty',
  '/login': 'Đăng nhập',
  '/register': 'Đăng ký',
  '/verify-email': 'Xác thực email',
  '/verify-success': 'Xác thực thành công',
  '/payment/result': 'Kết quả thanh toán',
  '/internal/admin/users': 'Người dùng',
  '/internal/admin/companies': 'Doanh nghiệp',
  '/internal/moderator/job-approval': 'Duyệt tin tuyển dụng',
  ...Object.fromEntries([...EMPLOYER_MENU, ...CANDIDATE_MENU].map(item => [item.path, item.label]))
};

// Tiêu đề tab trình duyệt cho một đường dẫn, ví dụ "Việc làm | Unijob"
export const pageTitleFor = (pathname) => {
  if (!pathname || pathname === '/') return HOME_TITLE;
  const match = Object.keys(PAGE_TITLES)
    .filter(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
    .sort((a, b) => b.length - a.length)[0];
  return match ? `${PAGE_TITLES[match]} | ${APP_NAME}` : APP_NAME;
};
