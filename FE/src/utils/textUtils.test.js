import { describe, it, expect } from 'vitest';
import { getInitials, formatDate, formatDateTime } from './textUtils';

describe('getInitials', () => {
  it('mặc định lấy 2 từ cuối (tên người)', () => {
    expect(getInitials('Trần Thu Hà')).toBe('TH');
    expect(getInitials('Nguyễn Văn An')).toBe('VA');
  });
  it("from = 'start' lấy 2 từ đầu (tên công ty)", () => {
    expect(getInitials('Unijob Studio Việt Nam', 'start')).toBe('US');
  });
  it('một từ thì một chữ cái, bỏ khoảng trắng thừa', () => {
    expect(getInitials('  unijob  ')).toBe('U');
  });
  it('trống thì là dấu hỏi', () => {
    expect(getInitials('')).toBe('?');
    expect(getInitials(null)).toBe('?');
    expect(getInitials('   ')).toBe('?');
  });
});

describe('formatDate', () => {
  it('định dạng ngày kiểu Việt Nam', () => {
    expect(formatDate('2026-03-05T10:00:00')).toBe(new Date('2026-03-05T10:00:00').toLocaleDateString('vi-VN'));
  });
  it('trống thì trả fallback (mặc định rỗng)', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined, '—')).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('có cả giờ và ngày', () => {
    const value = '2026-11-25T09:00:00';
    expect(formatDateTime(value)).toBe(
      new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
    );
  });
  it('trống thì trả fallback', () => {
    expect(formatDateTime('')).toBe('');
    expect(formatDateTime(null, '—')).toBe('—');
  });
});
