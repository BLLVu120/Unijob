import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  toSessionUser, saveSession, getCurrentUser, logout,
  setPendingUser, getPendingUser, clearPendingUser, changePassword
} from './authService';

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

// Giả lập BE: trả JSON theo URL được gọi
const mockApi = (routes) => {
  const fn = vi.fn((url) => {
    const key = Object.keys(routes).find(k => url.includes(k));
    const body = key ? routes[key] : { status: true };
    return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
};

describe('toSessionUser', () => {
  it('ứng viên: bỏ mật khẩu, gắn id / name / role', () => {
    const user = toSessionUser({ candidate_id: 3, full_name: 'Trần Thu Hà', email: 'a@x.vn', password: 'secret' }, 'candidate');
    expect(user).not.toHaveProperty('password');
    expect(user).toMatchObject({ id: 3, name: 'Trần Thu Hà', role: 'candidate', roleName: 'Ứng viên' });
  });
  it('nhà tuyển dụng: dùng emp_id / emp_name', () => {
    const user = toSessionUser({ emp_id: 9, emp_name: 'Unijob Studio', password: 'x' }, 'employer');
    expect(user).not.toHaveProperty('password');
    expect(user).toMatchObject({ id: 9, name: 'Unijob Studio', role: 'employer', roleName: 'Nhà tuyển dụng' });
  });
});

describe('phiên đăng nhập', () => {
  it('lưu, đọc và đăng xuất', () => {
    expect(getCurrentUser()).toBeNull();
    saveSession({ id: 1, role: 'candidate' });
    expect(getCurrentUser()).toEqual({ id: 1, role: 'candidate' });
    logout();
    expect(getCurrentUser()).toBeNull();
  });
  it('dữ liệu hỏng thì coi như chưa đăng nhập', () => {
    localStorage.setItem('user', '{hỏng');
    expect(getCurrentUser()).toBeNull();
  });
});

describe('tài khoản chờ xác thực email', () => {
  it('lưu, đọc và xoá', () => {
    expect(getPendingUser()).toBeNull();
    setPendingUser({ email: 'a@x.vn', role: 'candidate' });
    expect(getPendingUser()).toEqual({ email: 'a@x.vn', role: 'candidate' });
    clearPendingUser();
    expect(getPendingUser()).toBeNull();
  });
});

describe('changePassword', () => {
  it('sai mật khẩu hiện tại thì báo lỗi và không cập nhật', async () => {
    saveSession({ email: 'hr@x.vn', role: 'employer' });
    const fetch = mockApi({ '/v1/employer/get_by_email': { employer: { email: 'hr@x.vn', password: 'old' } } });
    await expect(changePassword('wrong', 'New@1234')).rejects.toThrow('Mật khẩu hiện tại không đúng');
    expect(fetch.mock.calls.some(([url]) => url.includes('update_info'))).toBe(false);
  });

  it('nhà tuyển dụng đổi mật khẩu gọi đúng API employer', async () => {
    saveSession({ email: 'hr@x.vn', role: 'employer' });
    const fetch = mockApi({
      '/v1/employer/get_by_email': { employer: { email: 'hr@x.vn', emp_id: 1, emp_name: 'A', password: 'old' } },
      '/v1/employer/update_info': { status: true }
    });
    await changePassword('old', 'New@1234');
    const update = fetch.mock.calls.find(([url]) => url.includes('/v1/employer/update_info'));
    expect(update).toBeTruthy();
    expect(JSON.parse(update[1].body)).toMatchObject({ email: 'hr@x.vn', password: 'New@1234' });
  });

  it('ứng viên đổi mật khẩu gọi API candidate', async () => {
    saveSession({ email: 'a@x.vn', role: 'candidate' });
    const fetch = mockApi({
      '/v1/candidate/get_by_email': { candidate: { email: 'a@x.vn', candidate_id: 2, full_name: 'B', password: 'old' } }
    });
    await changePassword('old', 'New@1234');
    expect(fetch.mock.calls.some(([url]) => url.includes('/v1/candidate/update_info'))).toBe(true);
  });
});
