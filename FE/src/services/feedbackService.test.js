import { describe, it, expect, afterEach, vi } from 'vitest';
import { feedbackService } from './feedbackService';

afterEach(() => vi.unstubAllGlobals());

const mockFetch = (body) => {
  const fn = vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });
  vi.stubGlobal('fetch', fn);
  return fn;
};

describe('feedbackService', () => {
  it('addFeedback gửi đúng tên trường BE (employer_id → emp_id)', async () => {
    const fetch = mockFetch({ status: true, message: 'ok' });
    await feedbackService.addFeedback({ job_id: 'j1', employer_id: 'e1', candidate_id: 'c1', rate: 5, comment: 'Tốt' });
    const [url, options] = fetch.mock.calls[0];
    expect(url).toContain('/v1/feedback/add_feedback');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ job_id: 'j1', emp_id: 'e1', candidate_id: 'c1', rate: 5, comment: 'Tốt' });
  });

  it('addFeedback ném lỗi nghiệp vụ từ BE (vd. đã đánh giá rồi)', async () => {
    mockFetch({ status: false, error: 'Bạn đã đánh giá nhà tuyển dụng cho công việc này' });
    await expect(feedbackService.addFeedback({ job_id: 'j1', employer_id: 'e1', candidate_id: 'c1', rate: 4 }))
      .rejects.toThrow('Bạn đã đánh giá');
  });

  it('getByEmployer sắp xếp mới nhất trước', async () => {
    mockFetch({ status: true, feedbacks: [
      { feedback_id: 1, created_at: '2026-01-01T00:00:00Z' },
      { feedback_id: 2, created_at: '2026-06-01T00:00:00Z' }
    ] });
    const list = await feedbackService.getByEmployer('e1');
    expect(list.map(f => f.feedback_id)).toEqual([2, 1]);
  });
});
