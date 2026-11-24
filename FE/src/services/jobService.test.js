import { describe, it, expect, afterEach, vi } from 'vitest';
import { jobService, attachEmployers } from './jobService';

afterEach(() => vi.unstubAllGlobals());

// Giả lập BE: trả JSON theo đường dẫn được gọi
const mockApi = (routes) => {
  const fn = vi.fn((url) => {
    const key = Object.keys(routes).find(k => url.includes(k));
    return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(routes[key] || {})) });
  });
  vi.stubGlobal('fetch', fn);
  return fn;
};

const EMPLOYERS = { employers: [{ emp_id: 'e1', emp_name: 'Unijob Studio', is_verified: true }] };

describe('attachEmployers', () => {
  it('gắn tên công ty và trạng thái xác thực, công ty không tồn tại thì dùng tên mặc định', () => {
    const [a, b] = attachEmployers(
      [{ job_id: 1, employer_id: 'e1' }, { job_id: 2, employer_id: 'x' }],
      EMPLOYERS.employers
    );
    expect(a).toMatchObject({ company: 'Unijob Studio', companyVerified: true });
    expect(b).toMatchObject({ company: 'Nhà tuyển dụng', companyVerified: false, employer: null });
  });
});

describe('jobService.searchJobs', () => {
  it('gửi tham số qua query string và gắn thông tin công ty', async () => {
    const fetch = mockApi({
      '/v1/job/search': { status: true, jobs: [{ job_id: 1, employer_id: 'e1', title: 'Pha chế' }] },
      '/v1/admin/get_all_employers': EMPLOYERS
    });
    const jobs = await jobService.searchJobs({
      keyword: '  pha che ', location: 'Đà Nẵng', salaryMin: 0, jobType: 'remote', sortBy: 'salary', limit: 20
    });

    const url = new URL(fetch.mock.calls.find(([u]) => u.includes('/v1/job/search'))[0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      sort_by: 'salary', limit: '20', keyword: 'pha che', location: 'Đà Nẵng', salary_min: '0', job_type: 'remote'
    });
    expect(jobs[0]).toMatchObject({ title: 'Pha chế', company: 'Unijob Studio', companyVerified: true });
  });

  it('bỏ qua tham số trống, mặc định mới nhất', async () => {
    const fetch = mockApi({ '/v1/job/search': { status: true, jobs: [] }, '/v1/admin/get_all_employers': EMPLOYERS });
    expect(await jobService.getPublicJobs()).toEqual([]);
    const url = new URL(fetch.mock.calls.find(([u]) => u.includes('/v1/job/search'))[0]);
    expect(Object.fromEntries(url.searchParams)).toEqual({ sort_by: 'newest', limit: '500' });
  });
});
