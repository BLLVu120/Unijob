import { apiRequest, API_BASE } from '../api/api';

const enc = encodeURIComponent;

export const APPLICATION_STATUS = {
  submitted: { label: 'Đã nộp' },
  screening: { label: 'Đang xét duyệt' },
  interview: { label: 'Phỏng vấn' },
  recruited: { label: 'Đã tuyển' },
  rejected: { label: 'Từ chối' },
  withdrawn: { label: 'Đã rút' }
};

export const applicationService = {
  addApplication: (application) =>
    apiRequest('/v1/application/add', {
      method: 'POST',
      body: JSON.stringify(application),
    }),

  // Upload CV (PDF, tối đa 5MB). Trả về cv_url dạng tương đối: /cv/<tên file>
  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append('cv', file);

    let res;
    try {
      res = await fetch(`${API_BASE}/v1/application/upload-cv`, { method: 'POST', body: formData });
    } catch {
      throw new Error('Không kết nối được máy chủ. Vui lòng thử lại sau.');
    }

    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }

    if (!res.ok || data?.status === false) {
      throw new Error(data?.detail || data?.error || data?.message || 'Upload CV thất bại');
    }

    const raw = data?.cv_url || data?.path || '';
    return { ...data, cv_url: raw.replace('/src/store/cv', '/cv') };
  },

  getByJobId: async (jobId) => {
    const res = await apiRequest(`/v1/application/get_by_job_id?job_id=${enc(jobId)}`);
    return res.applications || [];
  },

  getByCandidateId: async (candidateId) => {
    const res = await apiRequest(`/v1/application/get_by_candidate_id?candidate_id=${enc(candidateId)}`);
    return res.applications || [];
  },

  // status: submitted | screening | interview | recruited | rejected | withdrawn
  updateStatus: (applicationId, status) =>
    apiRequest('/v1/application/update_status', {
      method: 'POST',
      body: JSON.stringify({ application_id: applicationId, status })
    }),

  getAll: async () => {
    const res = await apiRequest('/v1/admin/get_all_applications');
    return res.applications || [];
  }
};
