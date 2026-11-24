import { apiRequest } from '../api/api';
import { getAllEmployers } from './authService';

const enc = encodeURIComponent;

// BE chỉ nhận các trường này khi thêm / sửa tin
const JOB_FIELDS = [
  'job_id', 'employer_id', 'title', 'description', 'requirements', 'benefits',
  'salary_min', 'salary_max', 'location', 'role', 'education_level', 'experience',
  'num_slot', 'job_type', 'working_shifts', 'is_active', 'expiry_date'
];

const pickJobFields = (job) =>
  Object.fromEntries(
    JOB_FIELDS.filter(k => job[k] !== undefined && job[k] !== '').map(k => [k, job[k]])
  );

// Gắn tên công ty + trạng thái xác thực vào từng tin
export const attachEmployers = (jobs, employers) => {
  const byId = Object.fromEntries(employers.map(e => [e.emp_id, e]));
  return jobs.map(job => {
    const emp = byId[job.employer_id];
    return {
      ...job,
      company: emp?.emp_name || 'Nhà tuyển dụng',
      companyVerified: !!emp?.is_verified,
      employer: emp || null
    };
  });
};

const byNewest = (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0);

export const jobService = {
  addJob: (job) =>
    apiRequest('/v1/job/add', { method: 'POST', body: JSON.stringify(pickJobFields(job)) }),

  updateJob: (job) =>
    apiRequest('/v1/job/update', { method: 'POST', body: JSON.stringify(pickJobFields(job)) }),

  deleteJob: (jobId) =>
    apiRequest(`/v1/job/delete?job_id=${enc(jobId)}`, { method: 'DELETE' }),

  getJobById: async (jobId) => {
    const res = await apiRequest(`/v1/job/get_by_id?id=${enc(jobId)}`);
    return res.job && !Array.isArray(res.job) ? res.job : null;
  },

  getJobsByEmployer: async (empId) => {
    const res = await apiRequest(`/v1/job/get_by_emp_id?emp_id=${enc(empId)}`);
    return (res.jobs || []).sort(byNewest);
  },

  // Tất cả tin (kể cả đã đóng) — dùng cho admin / moderator
  getAllJobs: async () => {
    const res = await apiRequest('/v1/admin/get_all_jobs');
    return (res.jobs || []).sort(byNewest);
  },

  /*
   * Tìm tin công khai qua BE (GET /v1/job/search): chỉ tin đang mở, chưa hết hạn.
   * keyword khớp tiêu đề / vị trí / tên công ty, không phân biệt dấu.
   * sortBy: newest | oldest | salary | expired_day
   */
  searchJobs: async ({ keyword, location, salaryMin, jobType, sortBy = 'newest', limit = 500 } = {}) => {
    const params = new URLSearchParams({ sort_by: sortBy, limit: String(limit) });
    if (keyword?.trim()) params.set('keyword', keyword.trim());
    if (location?.trim()) params.set('location', location.trim());
    if (salaryMin != null && salaryMin !== '') params.set('salary_min', String(salaryMin));
    if (jobType) params.set('job_type', jobType);

    const [res, employers] = await Promise.all([
      apiRequest(`/v1/job/search?${params}`),
      getAllEmployers()
    ]);
    return attachEmployers(res.jobs || [], employers);
  },

  // Tin công khai: đang mở, kèm thông tin công ty, mới nhất trước
  getPublicJobs: () => jobService.searchJobs()
};
