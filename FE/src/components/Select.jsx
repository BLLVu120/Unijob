import { ChevronDown } from 'lucide-react';
import { COLORS } from '../constants/colors';

/*
 * Ô chọn dùng chung: ẩn mũi tên mặc định của trình duyệt, thay bằng icon ChevronDown
 * căn giữa theo chiều dọc (đồng bộ với các dropdown khác trong ứng dụng).
 * style: style của thẻ <select>; wrapperStyle: style khung bọc (vd. flex: 1 khi nằm cạnh icon);
 * iconRight: khoảng cách mũi tên tới mép phải (đặt 0 khi khung ngoài đã có padding);
 * các props còn lại truyền thẳng cho <select>.
 */
export default function Select({ style, wrapperStyle, iconRight = 14, children, ...props }) {
  return (
    <div style={{ position: 'relative', width: '100%', ...wrapperStyle }}>
      <select
        {...props}
        style={{
          width: '100%', cursor: 'pointer', ...style,
          appearance: 'none', WebkitAppearance: 'none', paddingRight: iconRight + 26
        }}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        color={COLORS.gray}
        style={{ position: 'absolute', right: iconRight, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      />
    </div>
  );
}
