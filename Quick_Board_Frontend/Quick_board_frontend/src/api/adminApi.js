// src/api/adminApi.js
import axios from "axios";

// Base axios instance - adjust baseURL/headers to fit your app
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const adminApi = {
  getAdmins: async () => {
    const res = await api.get("/admins");
    return res.data;
  },

  getAdmin: async (id) => {
    const res = await api.get(`/admins/${id}`);
    return res.data;
  },

  createAdmin: async (payload) => {
    const res = await api.post("/admins", payload);
    return res.data;
  },

  updateAdmin: async (id, payload) => {
    const res = await api.put(`/admins/${id}`, payload);
    return res.data;
  },

  deleteAdmin: async (id) => {
    const res = await api.delete(`/admins/${id}`);
    return res.data;
  },

  // Update the currently logged in admin's profile
  updateSelf: async (payload) => {
    // backend route: PUT /admins/me or /admins/self - adjust if different
    const res = await api.put("/admins/me", payload);
    return res.data;
  },
};

export default adminApi;