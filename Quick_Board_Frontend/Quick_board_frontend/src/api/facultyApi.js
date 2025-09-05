// src/api/facultyApi.js
import { authAPI } from "./authApi";

/**
 * Faculty API helper using authAPI.apiCall (fetch wrapper).
 * Endpoints expected:
 * GET  /Faculty                -> list faculties
 * PUT  /Faculty/approve/{id}   -> approve faculty (body { AdminId })
 * DELETE /Faculty/{id}         -> delete faculty
 */

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
};

export default facultyApi;