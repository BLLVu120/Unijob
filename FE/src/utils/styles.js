import { COLORS } from '../constants/colors';

const C = COLORS;

export const flex = (align = 'center', dir = 'row') => ({
  display: 'flex',
  alignItems: align,
  flexDirection: dir
});

export const txt = (size, weight = 400, color = C.navy) => ({
  fontSize: `${size}px`,
  fontWeight: weight,
  color,
  margin: 0,
  lineHeight: 1.5
});
