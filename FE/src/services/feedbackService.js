import { apiRequest } from '../api/api';

const BASE = '/v1/feedback';

export const feedbackService = {
  addFeedback: async ({
    job_id,
    employer_id,
    candidate_id,
    rate,
    comment
  }) => {
    return await apiRequest(`${BASE}/add_feedback`, {
      method: 'POST',
      body: JSON.stringify({
        job_id,
        emp_id: employer_id,
        candidate_id,
        rate,
        comment
      })
    });
  },

  // Danh sách đánh giá của ứng viên về một nhà tuyển dụng (mới nhất trước)
  getByEmployer: async (employer_id) => {
    const res = await apiRequest(
      `${BASE}/get_feedback_by_employer_id?emp_id=${encodeURIComponent(employer_id)}`
    );
    return (res.feedbacks || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
};