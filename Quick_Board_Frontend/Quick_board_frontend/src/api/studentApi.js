// src/api/studentApi.js
import { authAPI } from "./authApi";

/**
 * Student API helper using authAPI.apiCall (fetch wrapper).
 * Endpoints:
 * GET    /Student               -> list students
 * PUT    /Student/approve/{id}  -> approve student (body { FacultyId })
 * DELETE /Student/{id}          -> delete student
 */

const studentApi = {
  getAll: async () => {
    return await authAPI.apiCall("/Student", { method: "GET" });
  },

  approve: async (studentId, facultyId) => {
    return await authAPI.apiCall(`/Student/approve/${studentId}`, {
      method: "PUT",
      body: JSON.stringify({ FacultyId: facultyId }),
      headers: { "Content-Type": "application/json" },
    });
  },

  delete: async (studentId) => {
    return await authAPI.apiCall(`/Student/${studentId}`, {
      method: "DELETE",
    });
  },
};

export default studentApi;