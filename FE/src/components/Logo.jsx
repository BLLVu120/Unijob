import { Link } from 'react-router-dom';
import { COLORS, GRADIENT } from '../constants/colors';

// Logo Unijob: ô vuông gradient + chữ
export default function Logo({ to = '/', dark = false, size = 'md', subtitle }) {
  const box = size === 'sm' ? 30 : 34;
  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        width: box, height: box, borderRadius: 10,
        background: GRADIENT.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: COLORS.white, fontWeight: 800, fontSize: box * 0.5,
        boxShadow: '0 4px 12px rgba(109, 93, 252, 0.35)'
      }}>
        U
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{
          fontSize: size === 'sm' ? 18 : 20, fontWeight: 800, letterSpacing: '-0.02em',
          color: dark ? COLORS.white : COLORS.navy
        }}>
          Unijob
        </span>
        {subtitle && (
          <span style={{ fontSize: 11, fontWeight: 500, color: dark ? COLORS.grayLight : COLORS.gray, marginTop: 2 }}>
            {subtitle}
          </span>
        )}
      </span>
    </Link>
  );
}
