import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Briefcase, Coffee, Code } from 'lucide-react';
import {
  formatSalary, formatExperience, timeAgo, normalize, matchesIndustry, jobIcon,
  matchesLocation, isJobOpen, readSavedJobs, toggleSavedJob, cvLink
} from './jobFormat';
import { API_BASE } from '../api/api';

describe('formatSalary', () => {
  it('hiển thị khoảng lương khi có cả min và max', () => {
    expect(formatSalary(5000000, 8000000)).toBe('5.000.000 - 8.000.000 VNĐ');
  });
  it('chỉ có min hoặc max', () => {
    expect(formatSalary(5000000, null)).toBe('Từ 5.000.000 VNĐ');
    expect(formatSalary(null, 8000000)).toBe('Đến 8.000.000 VNĐ');
  });
  it('không có lương thì là thỏa thuận', () => {
    expect(formatSalary(null, null)).toBe('Thỏa thuận');
    expect(formatSalary(0, 0)).toBe('Thỏa thuận');
  });
});

describe('formatExperience', () => {
  it('0 hoặc trống là không yêu cầu', () => {
    expect(formatExperience(0)).toBe('Không yêu cầu');
    expect(formatExperience(undefined)).toBe('Không yêu cầu');
  });
  it('có số năm', () => {
    expect(formatExperience(2)).toBe('2 năm kinh nghiệm');
  });
});

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-25T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('trả về chuỗi rỗng khi không có giá trị', () => {
    expect(timeAgo(null)).toBe('');
  });
  it('các mốc thời gian', () => {
    expect(timeAgo('2026-11-25T11:59:30Z')).toBe('Vừa xong');
    expect(timeAgo('2026-11-25T11:45:00Z')).toBe('15 phút trước');
    expect(timeAgo('2026-11-25T09:00:00Z')).toBe('3 giờ trước');
    expect(timeAgo('2026-11-20T12:00:00Z')).toBe('5 ngày trước');
  });
  it('quá 30 ngày thì hiện ngày', () => {
    expect(timeAgo('2026-01-01T12:00:00Z')).toBe(new Date('2026-01-01T12:00:00Z').toLocaleDateString('vi-VN'));
  });
});

describe('normalize', () => {
  it('bỏ dấu, chữ thường, đ → d', () => {
    expect(normalize('Đà Nẵng')).toBe('da nang');
    expect(normalize('Nhân Viên Pha Chế')).toBe('nhan vien pha che');
  });
  it('an toàn với null / số', () => {
    expect(normalize(null)).toBe('');
    expect(normalize(123)).toBe('123');
  });
});

describe('matchesIndustry / jobIcon', () => {
  const barista = { title: 'Nhân viên pha chế part-time', role: 'Nhân viên' };
  const dev = { title: 'Thực tập Frontend Developer', role: 'Intern' };
  const other = { title: 'Trợ lý', role: '' };

  it('không chọn ngành thì khớp tất cả', () => {
    expect(matchesIndustry(other, '')).toBe(true);
  });
  it('khớp theo từ khóa trong tiêu đề (không phân biệt dấu)', () => {
    expect(matchesIndustry(barista, 'fnb')).toBe(true);
    expect(matchesIndustry(barista, 'tech')).toBe(false);
    expect(matchesIndustry(dev, 'tech')).toBe(true);
  });
  it('chọn icon theo ngành, mặc định là Briefcase', () => {
    expect(jobIcon(barista)).toBe(Coffee);
    expect(jobIcon(dev)).toBe(Code);
    expect(jobIcon(other)).toBe(Briefcase);
  });
});

describe('matchesLocation', () => {
  it('không chọn địa điểm thì khớp tất cả', () => {
    expect(matchesLocation({ location: 'Huế' }, '')).toBe(true);
  });
  it('khớp các cách viết khác nhau', () => {
    expect(matchesLocation({ location: 'Quận 1, TP. Hồ Chí Minh' }, 'hcm')).toBe(true);
    expect(matchesLocation({ location: 'Hải Châu, Đà Nẵng' }, 'danang')).toBe(true);
    expect(matchesLocation({ location: 'Cầu Giấy, Hà Nội' }, 'hcm')).toBe(false);
  });
  it('việc từ xa khớp bộ lọc remote dù địa chỉ khác', () => {
    expect(matchesLocation({ location: 'Hà Nội', job_type: 'remote' }, 'remote')).toBe(true);
  });
});

describe('isJobOpen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-25T12:00:00'));
  });
  afterEach(() => vi.useRealTimers());

  it('tin bị tắt thì đóng', () => {
    expect(isJobOpen({ is_active: false })).toBe(false);
  });
  it('tin hết hạn thì đóng, hạn hôm nay vẫn mở', () => {
    expect(isJobOpen({ is_active: true, expiry_date: '2026-11-24' })).toBe(false);
    expect(isJobOpen({ is_active: true, expiry_date: '2026-11-25' })).toBe(true);
  });
  it('không có hạn thì mở', () => {
    expect(isJobOpen({ is_active: true })).toBe(true);
  });
});

describe('tin đã lưu (localStorage)', () => {
  beforeEach(() => localStorage.clear());

  it('mặc định rỗng, dữ liệu hỏng cũng trả rỗng', () => {
    expect(readSavedJobs()).toEqual([]);
    localStorage.setItem('savedJobs', '{hỏng');
    expect(readSavedJobs()).toEqual([]);
  });
  it('bấm lần 1 là lưu, lần 2 là bỏ lưu', () => {
    expect(toggleSavedJob(7)).toBe(true);
    expect(readSavedJobs()).toEqual([7]);
    expect(toggleSavedJob(7)).toBe(false);
    expect(readSavedJobs()).toEqual([]);
  });
});

describe('cvLink', () => {
  it('trống thì trả rỗng', () => {
    expect(cvLink('')).toBe('');
  });
  it('giữ nguyên đường dẫn đầy đủ', () => {
    expect(cvLink('https://cdn.example.com/a.pdf')).toBe('https://cdn.example.com/a.pdf');
  });
  it('ghép API_BASE cho đường dẫn tương đối và đổi /src/store/cv thành /cv', () => {
    expect(cvLink('/cv/a.pdf')).toBe(`${API_BASE}/cv/a.pdf`);
    expect(cvLink('/src/store/cv/a.pdf')).toBe(`${API_BASE}/cv/a.pdf`);
  });
});
