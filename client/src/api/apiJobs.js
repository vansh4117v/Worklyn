import api from "./axios";

export async function getJobs( { location, company_id, searchQuery, page = 1, limit = 20 }) {
  const params = new URLSearchParams();
  if (location) params.append("location", location);
  if (company_id) params.append("company_id", company_id);
  if (searchQuery) params.append("searchQuery", searchQuery);
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  
  const response = await api.get("/jobs", { params });
  return response.data;
}

export async function saveJob( { alreadySaved }, saveData) {
  if (alreadySaved) {
    const response = await api.delete(`/saved-jobs/${saveData.job_id}`);
    return response.data;
  } else {
    const response = await api.post("/saved-jobs", saveData );
    return response.data;
  }
}

export async function getSingleJob( { jobId }) {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
}

export async function updateHiringStatus({ job_id }, isOpen) {
  const response = await api.patch("/jobs/hiring-status", { job_id, isOpen  });
  return response.data;
}

export async function addNewJob( _, jobData) {
  const response = await api.post("/jobs", jobData );
  return response.data;
}

export async function getSavedJobs() {
  const response = await api.get("/saved-jobs");
  return response.data;
}

export async function getMyJobs() {
  const response = await api.get("/jobs/get-my-jobs");
  return response.data;
}

export async function deleteJob({ job_id }) {
  const response = await api.delete(`/jobs/${job_id}`);
  return response.data;
}
