import { apiRequest } from '../api/api';

const enc = encodeURIComponent;

export const interviewService = {
  // interview: { job_id, emp_id, candidate_id, time (ISO), duration (phút) }
  add: (interview) =>
    apiRequest('/v1/interview/add', {
      method: 'POST',
      body: JSON.stringify({ interview_id: crypto.randomUUID(), ...interview })
    }),

  update: (interview) =>
    apiRequest('/v1/interview/update', {
      method: 'POST',
      body: JSON.stringify(interview)
    }),

  getByCandidate: async (candidateId) => {
    const res = await apiRequest(`/v1/interview/get_by_candidate_id?candidate_id=${enc(candidateId)}`);
    return res.interviews || [];
  },

  getByEmployer: async (empId) => {
    const res = await apiRequest(`/v1/interview/get_by_emp_id?emp_id=${enc(empId)}`);
    return res.interviews || [];
  }
};
