import { apiRequest } from "../api/api";

export const jobService = {
  addJob: async (job) => {
    return apiRequest("/v1/job/add", {
      method: "POST",
      body: JSON.stringify(job)
    });
  },

  getJobsByEmployer: async (empId) => {
    const res = await apiRequest(`/v1/job/get_by_emp_id?emp_id=${empId}`);
    return res.jobs || [];
  },

  deleteJob: async (jobId) => {
    return apiRequest(`/v1/job/delete?job_id=${jobId}`, {
      method: "DELETE"
    });
  },

  updateJob: async (job) => {
    return apiRequest("/v1/job/update", {
      method: "POST",
      body: JSON.stringify(job)
    });
  },

  getJobById: async (jobId) => {
    const res = await apiRequest(`/v1/job/get_by_id?id=${jobId}`);
    return res.job;
  },
};