import { describe, it, expect } from 'vitest';
import { EMPLOYER_MENU, CANDIDATE_MENU } from './menus';

describe('menu', () => {
  it.each([['nhà tuyển dụng', EMPLOYER_MENU, '/employer/'], ['ứng viên', CANDIDATE_MENU, '/candidate/']])(
    'menu %s có đường dẫn đúng khu vực và không trùng',
    (_, menu, prefix) => {
      const paths = menu.map(item => item.path);
      expect(new Set(paths).size).toBe(paths.length);
      paths.forEach(p => expect(p.startsWith(prefix)).toBe(true));
      menu.forEach(item => {
        expect(item.label).toBeTruthy();
        expect(item.icon).toBeTruthy();
      });
    }
  );
  it('cả hai vai trò đều có trang đổi mật khẩu', () => {
    expect(EMPLOYER_MENU.some(i => i.path === '/employer/change-password')).toBe(true);
    expect(CANDIDATE_MENU.some(i => i.path === '/candidate/change-password')).toBe(true);
  });
});
