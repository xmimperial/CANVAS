import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ─── Designs ──────────────────────────────────────────────────────────────────
export const saveDesign = (data) => api.post("/designs", data);
export const updateDesign = (id, data) => api.put(`/designs/${id}`, data);
export const getDesign = (id) => api.get(`/designs/${id}`);
export const getAllDesigns = (params) => api.get("/designs", { params });
export const deleteDesign = (id) => api.delete(`/designs/${id}`);

// ─── Image upload ─────────────────────────────────────────────────────────────
export const uploadImage = (file) => {
  const form = new FormData();
  form.append("image", file);
  return api.post("/designs/upload-image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;
