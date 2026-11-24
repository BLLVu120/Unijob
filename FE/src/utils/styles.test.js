import { describe, it, expect } from 'vitest';
import { flex, txt, card } from './styles';
import { COLORS } from '../constants/colors';

describe('flex', () => {
  it('mặc định căn giữa theo hàng', () => {
    expect(flex()).toEqual({ display: 'flex', alignItems: 'center', flexDirection: 'row' });
  });
  it('nhận căn chỉnh và hướng', () => {
    expect(flex('flex-start', 'column')).toEqual({ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' });
  });
});

describe('txt', () => {
  it('đặt cỡ, độ đậm, màu và reset margin', () => {
    const s = txt(14, 600, COLORS.gray);
    expect(s).toMatchObject({ fontSize: '14px', fontWeight: 600, color: COLORS.gray, margin: 0 });
  });
  it('mặc định màu navy, độ đậm 400', () => {
    expect(txt(14)).toMatchObject({ fontWeight: 400, color: COLORS.navy });
  });
  it('giãn chữ âm cho tiêu đề lớn', () => {
    expect(txt(28).letterSpacing).toBe('-0.02em');
    expect(txt(18).letterSpacing).toBe('-0.01em');
    expect(txt(14).letterSpacing).toBe('normal');
  });
});

describe('card', () => {
  it('nền trắng, có viền, cho phép ghi đè', () => {
    expect(card()).toMatchObject({ background: COLORS.white, border: `1px solid ${COLORS.border}` });
    expect(card({ padding: 20 }).padding).toBe(20);
  });
});
