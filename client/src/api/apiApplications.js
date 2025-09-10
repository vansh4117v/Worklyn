import api from "./axios";

export async function applyTojob(_, jobData) {
  const formData = new FormData();
  Object.entries(jobData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  const response = await api.post("/applications/apply", formData);
  return response.data;
}

export async function updateApplication({ job_id, candidate_id }, status) {
  const response = await api.patch("/applications/status", { job_id, candidate_id, status });
  return response.data;
}

export async function getApplications() {
  const response = await api.get("/applications");
  return response.data;
}
