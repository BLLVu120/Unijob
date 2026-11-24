import {
  User, Bookmark, Send, MessageSquare, Lock, Building2, FileText, Users,
  CreditCard, Receipt, ShieldCheck, CalendarDays
} from 'lucide-react';

// Menu khu vực nhà tuyển dụng / ứng viên (dùng cho Navbar và Sidebar)
export const EMPLOYER_MENU = [
  { icon: Building2, label: 'Hồ sơ công ty', path: '/employer/company-profile' },
  { icon: FileText, label: 'Tin tuyển dụng', path: '/employer/jobs' },
  { icon: Users, label: 'Ứng viên', path: '/employer/candidates' },
  { icon: MessageSquare, label: 'Tin nhắn', path: '/employer/messages' },
  { icon: CreditCard, label: 'Gói dịch vụ', path: '/employer/subscription' },
  { icon: Receipt, label: 'Lịch sử giao dịch', path: '/employer/transactions' },
  { icon: ShieldCheck, label: 'Xác thực doanh nghiệp', path: '/employer/verification' },
  { icon: Lock, label: 'Đổi mật khẩu', path: '/employer/change-password' }
];

export const CANDIDATE_MENU = [
  { icon: User, label: 'Hồ sơ cá nhân', path: '/candidate/profile' },
  { icon: Bookmark, label: 'Việc đã lưu', path: '/candidate/saved-jobs' },
  { icon: Send, label: 'Việc đã ứng tuyển', path: '/candidate/applied-jobs' },
  { icon: CalendarDays, label: 'Lịch phỏng vấn', path: '/candidate/interviews' },
  { icon: MessageSquare, label: 'Tin nhắn', path: '/candidate/messages' },
  { icon: Lock, label: 'Đổi mật khẩu', path: '/candidate/change-password' }
];

