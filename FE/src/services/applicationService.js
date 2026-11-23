import { apiRequest, API_BASE } from "../api/api";

export const applicationService = {
  addApplication: async (application) => {
    return apiRequest("/v1/application/add", {
      method: "POST",
      body: JSON.stringify(application),
    });
  },

  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append("cv", file);

    const res = await fetch(`${API_BASE}/v1/application/upload-cv`, {
      method: "POST",
      body: formData,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) throw new Error(data?.message || "Upload CV failed");

    let cvUrl = data?.cv_url || data?.path;

    if (cvUrl && !cvUrl.startsWith("http")) {
      cvUrl = cvUrl.replace("/src/store/cv", "/cv");
      cvUrl = API_BASE + cvUrl;
    }

    return {
      ...data,
      cv_url: cvUrl
    };
  },

  getByJobId: async (jobId) => {
    const res = await apiRequest(`/v1/application/get_by_job_id?job_id=${jobId}`);
    return res.applications || [];
  },

  getByCandidateId: async (candidateId) => {
    const res = await apiRequest(`/v1/application/get_by_candidate_id?candidate_id=${candidateId}`);
    return res.applications || [];
  },
};