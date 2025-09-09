// src/api/facultyApi.js
import { authAPI } from "./authApi";

const facultyApi = {
  getAll: async () => {
    return await authAPI.apiCall("/Faculty", { method: "GET" });
  },

  approve: async (facultyId, adminId) => {
    return await authAPI.apiCall(`/Faculty/approve/${facultyId}`, {
      method: "PUT",
      body: JSON.stringify({ AdminId: adminId }),
      headers: { "Content-Type": "application/json" },
    });
  },

  delete: async (facultyId) => {
    return await authAPI.apiCall(`/Faculty/${facultyId}`, {
      method: "DELETE",
    });
  },

  update: async (facultyId, payload) => {
    return await authAPI.apiCall(`/Faculty/${facultyId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  },
};

export default facultyApi;