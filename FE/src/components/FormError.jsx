import { AlertCircle } from 'lucide-react';
import { COLORS } from '../constants/colors';

// Thông báo lỗi của form (đăng nhập / đăng ký): nền đỏ nhạt + icon cảnh báo
export default function FormError({ message }) {
  if (!message) return null;
  return (
    <div role="alert" style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', marginBottom: 16,
      borderRadius: 12, background: COLORS.redBg, border: `1px solid ${COLORS.redBorder}`,
      color: COLORS.red, fontSize: 14, fontWeight: 500, lineHeight: 1.5
    }}>
      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{message}</span>
    </div>
  );
}
