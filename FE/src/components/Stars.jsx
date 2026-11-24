import { useState } from 'react';
import { Star } from 'lucide-react';
import { COLORS } from '../constants/colors';

/*
 * Hàng 5 sao.
 *  - Chỉ hiển thị: <Stars value={4.2} />
 *  - Cho chọn điểm: <Stars value={rate} onChange={setRate} size={28} />
 */
export default function Stars({ value = 0, size = 14, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || Math.round(value);

  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: onChange ? 6 : 2 }}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map(i => {
        const icon = <Star size={size} color={COLORS.amber} fill={i <= shown ? COLORS.amber : 'none'} />;
        if (!onChange) return <span key={i} style={{ display: 'inline-flex' }}>{icon}</span>;
        return (
          <button
            key={i}
            type="button"
            aria-label={`${i} sao`}
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex',
              transform: i <= shown ? 'scale(1.08)' : 'none', transition: 'transform .12s ease'
            }}
          >
            {icon}
          </button>
        );
      })}
    </span>
  );
}
