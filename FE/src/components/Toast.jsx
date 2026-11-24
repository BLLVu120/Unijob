import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, TriangleAlert } from 'lucide-react';
import { COLORS, SHADOW } from '../constants/colors';
import { flex, txt } from '../utils/styles';

const C = COLORS;

const TYPES = {
  success: { color: C.green, bg: C.greenBg, border: C.greenBorder, icon: CheckCircle2 },
  error: { color: C.red, bg: C.redBg, border: C.redBorder, icon: AlertCircle },
  warning: { color: C.orange, bg: C.orangeBg, border: C.orangeLight, icon: TriangleAlert }
};

/**
 * Toast thông báo ở góc phải dưới màn hình (dùng chung cho mọi trang).
 * Hai cách gọi:
 *   <Toast message={{ type: 'success', text: '...' }} onClose={...} />
 *   <Toast message="..." type="warning" onClose={...} />   (cách cũ, vẫn hỗ trợ)
 * type: 'success' | 'error' | 'warning'
 * onClose: xóa thông báo ở trang cha — nên bọc bằng useCallback để bộ đếm không bị đặt lại mỗi lần render.
 * Tự ẩn sau `duration` ms; bấm × để tắt ngay.
 */
export default function Toast({ message, type = 'error', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message || !onClose) return undefined;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, onClose, duration]);

  if (!message) return null;
  const msg = typeof message === 'string' ? { type, text: message } : message;
  const t = TYPES[msg.type] || TYPES.error;
  const Icon = t.icon;

  return (
    <div role="status" style={{
      position: 'fixed', right: 24, bottom: 24, zIndex: 10000, maxWidth: 380,
      ...flex('center'), gap: 12, padding: '14px 14px 14px 16px', borderRadius: 14,
      background: C.white, border: `1px solid ${t.border}`,
      borderLeft: `4px solid ${t.color}`, boxShadow: SHADOW.lg, animation: 'toastIn .25s ease'
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: t.bg,
        ...flex('center'), justifyContent: 'center'
      }}>
        <Icon size={18} color={t.color} />
      </span>
      <span style={{ ...txt(14, 600, C.navy), flex: 1 }}>{msg.text}</span>
      {onClose && (
        <button onClick={onClose} title="Đóng" style={{
          width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent',
          cursor: 'pointer', ...flex('center'), justifyContent: 'center', flexShrink: 0
        }}>
          <X size={16} color={C.gray} />
        </button>
      )}
    </div>
  );
}
