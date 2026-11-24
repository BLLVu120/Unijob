import { COLORS } from '../constants/colors';
import { PASSWORD_RULES, getPasswordStrength } from '../utils/password';

// Thanh 5 nấc + nhãn độ mạnh bọc thẻ
export default function PasswordStrength({ password, style }) {
  if (!password) return null;
  const { passed, label, color } = getPasswordStrength(password);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${PASSWORD_RULES.length}, 1fr)`, gap: 4 }}>
        {PASSWORD_RULES.map((_, i) => (
          <span key={i} style={{
            height: 6, borderRadius: 999, transition: 'background .2s ease',
            background: i < passed ? color : COLORS.border
          }} />
        ))}
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, color, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap',
        background: `${color}1a`, border: `1px solid ${color}55`
      }}>
        {label}
      </span>
    </div>
  );
}
