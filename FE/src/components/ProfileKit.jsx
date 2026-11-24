// Các khối giao diện dùng chung cho trang hồ sơ (ứng viên + nhà tuyển dụng)
import { X, Edit2, BadgeCheck } from 'lucide-react';
import { COLORS, GRADIENT, SHADOW } from '../constants/colors';
import { flex, txt, card } from '../utils/styles';
import Select from './Select';

const C = COLORS;


const TONES = {
  purple: { bg: C.blueLight, color: C.purple },
  green: { bg: C.greenBg, color: C.green },
  orange: { bg: C.orangeBg, color: C.orange }
};

/** Toast thông báo ở góc phải dưới (xem components/Toast.jsx) */
export { default as MessageBanner } from './Toast';

/**
 * Thẻ hồ sơ: ảnh bìa, avatar nhô lên, tên + huy hiệu xác thực, các nhãn, nút chỉnh sửa.
 * badges: [{ icon, label, tone: 'purple' | 'green' | 'orange' }]
 * children: phần bên dưới đường kẻ (các ô thông tin...)
 */
// flat: bỏ viền/bóng khi đặt trong hộp thoại; onEdit không truyền thì ẩn nút chỉnh sửa
export const ProfileCard = ({ initials, name, verified, badges = [], editLabel = 'Chỉnh sửa hồ sơ', onEdit, flat = false, children }) => (
  <div style={flat ? { overflow: 'hidden' } : { ...card(), overflow: 'hidden' }}>
    <div style={{ height: 120, background: GRADIENT.hero, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -190, right: 60 }} />
    </div>

    {/* Avatar nhô lên ảnh bìa; đáy khối tên thẳng đáy avatar */}
    <div style={{ padding: '0 32px 28px', ...flex('flex-end'), gap: 22 }}>
      <div style={{
        width: 124, height: 124, borderRadius: 28, background: C.white, padding: 6,
        boxShadow: SHADOW.md, flexShrink: 0, marginTop: -62,
        position: 'relative', zIndex: 1 // nằm trên ảnh bìa
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: 22, background: GRADIENT.primary,
          ...flex('center'), justifyContent: 'center'
        }}>
          <span style={{ ...txt(38, 800, C.white) }}>{initials}</span>
        </div>
      </div>

      <div style={{
        flex: 1, minWidth: 0, paddingTop: 22,
        ...flex('center'), justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...flex('center'), gap: 10, marginBottom: 10 }}>
            <h2 style={{ ...txt(26, 800), lineHeight: 1.2 }}>{name}</h2>
            {verified && (
              <span title="Đã xác thực" style={{ display: 'inline-flex', flexShrink: 0 }}>
                <BadgeCheck size={22} color={C.purple} />
              </span>
            )}
          </div>
          <div style={{ ...flex('center'), gap: 8, flexWrap: 'wrap' }}>
            {badges.map(({ icon, label, tone = 'purple' }) => {
              const Icon = icon;
              const t = TONES[tone];
              return (
                <span key={label} style={{
                  ...flex('center'), gap: 6, height: 28, padding: '0 12px', borderRadius: 999,
                  background: t.bg, ...txt(13, 600, t.color)
                }}>
                  {Icon && <Icon size={14} />} {label}
                </span>
              );
            })}
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              height: 42, padding: '0 18px', borderRadius: 12, border: `1px solid ${C.blueBorder}`,
              background: C.blueLight, color: C.purple, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', ...flex('center'), gap: 8
            }}
          >
            <Edit2 size={16} /> {editLabel}
          </button>
        )}
      </div>
    </div>

    <div style={{ borderTop: `1px solid ${C.border}`, padding: '28px 32px 32px' }}>
      {children}
    </div>
  </div>
);

/** Tiêu đề mục trong thẻ hồ sơ: ô icon tím nhạt + chữ đậm (cùng kiểu tiêu đề ở trang chi tiết việc làm / công ty) */
export const SectionHeading = ({ icon: Icon, children }) => (
  <h3 style={{ ...txt(18, 700), marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{
      width: 34, height: 34, borderRadius: 10, background: C.blueLight,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={17} color={C.purple} />
    </span>
    {children}
  </h3>
);

/** Lưới 3 cột, các ô cao bằng nhau */
export const TileGrid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridAutoRows: '1fr', gap: 16 }}>
    {children}
  </div>
);

/** Ô thông tin: nền gradient, chữ trắng, icon trong ô kính mờ */
export const InfoTile = ({ icon, label, value, gradient, style }) => {
  const Icon = icon;
  const empty = !value;
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', minWidth: 0, minHeight: 84,
      ...flex('center'), gap: 12, padding: '14px 16px', borderRadius: 14,
      background: gradient, boxShadow: SHADOW.sm, ...style
    }}>
      <div style={{
        position: 'absolute', width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)', top: -50, right: -40, pointerEvents: 'none'
      }} />
      <div style={{
        width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.3)',
        ...flex('center'), justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={21} color={C.white} />
      </div>
      <div style={{ minWidth: 0, position: 'relative' }}>
        <p style={{ ...txt(12, 500, 'rgba(255,255,255,0.8)'), marginBottom: 4 }}>{label}</p>
        <p style={{
          ...txt(15, empty ? 500 : 700, empty ? 'rgba(255,255,255,0.75)' : C.white),
          lineHeight: 1.4, overflowWrap: 'break-word'
        }}>
          {value || 'Chưa cập nhật'}
        </p>
      </div>
    </div>
  );
};

/** Email được phép xuống dòng ngay trước dấu @ thay vì ngắt giữa chữ */
export const EmailText = ({ email }) => {
  const at = email.indexOf('@');
  if (at < 0) return email;
  return <>{email.slice(0, at)}<wbr />{email.slice(at)}</>;
};

/** Hộp thoại chỉnh sửa (nút Hủy / Lưu thay đổi ở chân) */
export const ProfileModal = ({ open, onClose, title, children, onSave, saving, maxWidth = 720 }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 9998, animation: 'fadeIn .15s ease'
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
        ...flex('center', 'column'), justifyContent: 'center', padding: 24
      }}>
        <div style={{
          background: C.white, borderRadius: 18, width: '100%', maxWidth, pointerEvents: 'auto',
          maxHeight: '90vh', overflowY: 'auto', boxShadow: SHADOW.lg, animation: 'slideDown .2s ease'
        }}>
          <div style={{
            ...flex('center'), justifyContent: 'space-between',
            padding: '22px 32px', borderBottom: `1px solid ${C.border}`,
            position: 'sticky', top: 0, background: C.white, zIndex: 2
          }}>
            <h3 style={{ ...txt(22, 700) }}>{title}</h3>
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white,
              cursor: 'pointer', ...flex('center'), justifyContent: 'center'
            }}>
              <X size={18} color={C.gray} />
            </button>
          </div>
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {children}
          </div>
          <div style={{
            ...flex('center'), justifyContent: 'flex-end', gap: 10,
            padding: '18px 32px', borderTop: `1px solid ${C.border}`
          }}>
            <button onClick={onClose} style={{
              height: 42, padding: '0 22px', borderRadius: 12, border: `1px solid ${C.border}`,
              background: C.white, color: C.navy, fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>
              Hủy
            </button>
            <button onClick={onSave} disabled={saving} style={{
              height: 42, padding: '0 22px', borderRadius: 12, border: 'none',
              background: C.purple, color: C.white, fontSize: 14, fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1
            }}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const fieldStyle = (disabled) => ({
  width: '100%', height: 44, padding: '0 14px', borderRadius: 12,
  border: `1px solid ${C.border}`, fontSize: 14, color: C.navy,
  outline: 'none', background: disabled ? C.grayBg : C.white,
  cursor: disabled ? 'not-allowed' : 'text', boxSizing: 'border-box', fontFamily: 'inherit'
});

const FieldLabel = ({ label, required }) => (
  <label style={{ ...txt(13, 600), display: 'block', marginBottom: 8 }}>
    {label} {required && <span style={{ color: C.red }}>*</span>}
  </label>
);

/** Ô nhập (input / textarea) trong hộp thoại */
export const FormField = ({ label, value, onChange, placeholder, disabled, required, type = 'text', textarea, rows = 3, full }) => (
  <div style={{ minWidth: 0, gridColumn: full ? '1 / -1' : 'auto' }}>
    <FieldLabel label={label} required={required} />
    {textarea ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        style={{ ...fieldStyle(disabled), height: 'auto', minHeight: 96, padding: '12px 14px', resize: 'vertical', lineHeight: 1.6 }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={fieldStyle(disabled)}
      />
    )}
    {disabled && (
      <p style={{ ...txt(12, 400, C.grayLight), marginTop: 6 }}>{label} không thể chỉnh sửa</p>
    )}
  </div>
);

/**
 * Mục trong hộp thoại chỉnh sửa — cùng kiểu form đăng tin tuyển dụng:
 * thẻ trắng viền đậm, tiêu đề có icon, các ô xếp lưới `cols` cột.
 */
export const FormSection = ({ icon, title, hint, cols = 2, children }) => {
  const Icon = icon;
  return (
    <div style={{ background: C.white, border: '1.5px solid #cbd2df', borderRadius: 16, padding: '20px 22px' }}>
      <div style={{ ...flex('center'), gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <span style={{
          width: 32, height: 32, borderRadius: 9, background: C.blueLight, flexShrink: 0,
          ...flex('center'), justifyContent: 'center'
        }}>
          <Icon size={17} color={C.purple} />
        </span>
        <h4 style={{ ...txt(16, 700) }}>{title}</h4>
        {hint && (
          <span style={{
            padding: '3px 10px', borderRadius: 999, background: C.grayBg,
            border: `1px solid ${C.border}`, ...txt(12, 500, C.gray)
          }}>
            {hint}
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 16 }}>
        {children}
      </div>
    </div>
  );
};

/** Ô chọn trong hộp thoại. options: [{ value, label }] */
export const FormSelect = ({ label, value, onChange, options, placeholder, required, full }) => (
  <div style={{ minWidth: 0, gridColumn: full ? '1 / -1' : 'auto' }}>
    <FieldLabel label={label} required={required} />
    <Select value={value} onChange={e => onChange(e.target.value)} style={fieldStyle(false)}>
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  </div>
);

/**
 * Hộp thoại xem hồ sơ (dùng cho trang quản trị): đặt ProfileCard flat bên trong.
 * Nút đóng nổi trên ảnh bìa; footer: các nút thao tác ở chân hộp thoại.
 */
export const ProfileDialog = ({ open, onClose, children, footer, maxWidth = 920 }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, animation: 'fadeIn .15s ease'
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1001, pointerEvents: 'none',
        ...flex('center', 'column'), justifyContent: 'center', padding: 24
      }}>
        <div style={{
          position: 'relative', background: C.white, borderRadius: 20, width: '100%', maxWidth, pointerEvents: 'auto',
          maxHeight: '90vh', overflowY: 'auto', boxShadow: SHADOW.lg, animation: 'slideDown .2s ease'
        }}>
          <button onClick={onClose} title="Đóng" style={{
            position: 'absolute', top: 16, right: 16, zIndex: 2, width: 36, height: 36, borderRadius: '50%',
            border: 'none', background: 'rgba(255,255,255,0.22)', cursor: 'pointer',
            ...flex('center'), justifyContent: 'center'
          }}>
            <X size={20} color={C.white} />
          </button>
          {children}
          {footer && (
            <div style={{
              ...flex('center'), justifyContent: 'flex-end', gap: 10,
              padding: '16px 32px', borderTop: `1px solid ${C.border}`
            }}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
