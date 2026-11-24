import { SearchX, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { COLORS } from '../constants/colors';

const C = COLORS;

const PRESETS = {
  loading: { icon: Loader2, tint: C.blueLight, color: C.purple, title: 'Đang tải dữ liệu...' },
  error: { icon: WifiOff, tint: C.redBg, color: C.red, title: 'Không tải được dữ liệu' },
  empty: { icon: SearchX, tint: C.blueLight, color: C.purple, title: 'Chưa có dữ liệu' }
};

/**
 * Khung trạng thái dùng chung: đang tải / lỗi / trống.
 * onRetry: hiện nút "Thử lại" (thường dùng cho lỗi).
 * icon: thay icon mặc định. compact: bỏ khung, thu nhỏ — dùng khi đặt bên trong một thẻ khác.
 */
export default function StateBox({ type = 'empty', title, message, onRetry, action, icon, compact = false }) {
  const preset = PRESETS[type];
  const Icon = icon || preset.icon;

  return (
    <div style={compact ? { padding: '20px 8px', textAlign: 'center' } : {
      background: C.white, borderRadius: 18, border: `1px solid ${C.border}`,
      padding: '56px 32px', textAlign: 'center'
    }}>
      <div style={{
        width: compact ? 44 : 64, height: compact ? 44 : 64, borderRadius: compact ? 12 : 18,
        background: preset.tint, margin: compact ? '0 auto 12px' : '0 auto 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon
          size={compact ? 20 : 28}
          color={preset.color}
          style={type === 'loading' ? { animation: 'spin 1s linear infinite' } : undefined}
        />
      </div>
      <h3 style={{ fontSize: compact ? 16 : 18, fontWeight: 700, color: C.navy, marginBottom: 6 }}>
        {title || preset.title}
      </h3>
      {message && (
        <p style={{ fontSize: 14, color: C.gray, maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>{message}</p>
      )}
      {(onRetry || action) && (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.white,
                color: C.navy, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8
              }}
            >
              <RefreshCw size={16} /> Thử lại
            </button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
