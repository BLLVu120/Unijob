import { apiRequest } from "../api/api";

const BASE = "/v1/feedback";

export const feedbackService = {
  addFeedback: async ({
    job_id,
    employer_id,
    candidate_id,
    rate,
    comment
  }) => {
    return await apiRequest(`${BASE}/add_feedback`, {
      method: "POST",
      body: JSON.stringify({
        job_id,
        emp_id: employer_id,
        candidate_id,
        rate,
        comment
      })
    });
  },

  getByEmployer: async (employer_id) => {
    return await apiRequest(
      `${BASE}/get_feedback_by_employer_id?emp_id=${employer_id}`
    );
  },
};