import { describe, it, expect } from 'vitest';
import { PASSWORD_RULES, getPasswordStrength, firstFailedRule } from './password';

describe('getPasswordStrength', () => {
  it.each([
    ['', 0, 'Rất yếu'],
    ['abc', 1, 'Rất yếu'],
    ['abcdefgh', 2, 'Yếu'],
    ['Abcdefgh', 3, 'Trung bình'],
    ['Abcdefg1', 4, 'Khá'],
    ['Abcdef1!', 5, 'Mạnh']
  ])('"%s" đạt %i yêu cầu → %s', (password, passed, label) => {
    const s = getPasswordStrength(password);
    expect(s.passed).toBe(passed);
    expect(s.label).toBe(label);
    expect(s.color).toBeTruthy();
  });
});

describe('firstFailedRule', () => {
  it('trả về yêu cầu đầu tiên chưa đạt', () => {
    expect(firstFailedRule('abc').text).toBe('Tối thiểu 8 ký tự');
    expect(firstFailedRule('abcdefgh').text).toBe('Có ít nhất 1 chữ hoa');
    expect(firstFailedRule('Abcdefg1').text).toBe('Có ít nhất 1 ký tự đặc biệt');
  });
  it('đạt hết thì trả null', () => {
    expect(firstFailedRule('Abcdef1!')).toBeNull();
  });
  it('có đủ 5 yêu cầu', () => {
    expect(PASSWORD_RULES).toHaveLength(5);
  });
});
