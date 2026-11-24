import { describe, it, expect } from 'vitest';
import { pageTitleFor, HOME_TITLE, APP_NAME } from './pageTitle';

describe('pageTitleFor', () => {
  it('trang chủ', () => {
    expect(pageTitleFor('/')).toBe(HOME_TITLE);
    expect(pageTitleFor('')).toBe(HOME_TITLE);
  });
  it('trang công khai và trang có tham số', () => {
    expect(pageTitleFor('/jobs')).toBe('Việc làm | Unijob');
    expect(pageTitleFor('/job-detail/abc')).toBe('Chi tiết việc làm | Unijob');
    expect(pageTitleFor('/company-detail/xyz')).toBe('Chi tiết công ty | Unijob');
  });
  it('/company không khớp nhầm với /company-detail', () => {
    expect(pageTitleFor('/company')).toBe('Công ty | Unijob');
  });
  it('lấy tên từ menu ứng viên / nhà tuyển dụng', () => {
    expect(pageTitleFor('/candidate/applied-jobs')).toBe('Việc đã ứng tuyển | Unijob');
    expect(pageTitleFor('/employer/jobs')).toBe('Tin tuyển dụng | Unijob');
    expect(pageTitleFor('/employer/change-password')).toBe('Đổi mật khẩu | Unijob');
  });
  it('đường dẫn lạ chỉ hiện tên ứng dụng', () => {
    expect(pageTitleFor('/khong-ton-tai')).toBe(APP_NAME);
  });
});
