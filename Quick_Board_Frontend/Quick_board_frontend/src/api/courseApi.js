// src/api/courseApi.js
import { authAPI } from "./authApi";

/**
 * Course API helper using authAPI.apiCall (fetch wrapper).
 * Endpoints:
 * GET    /Course          -> list courses (public)
 * GET    /Course/{id}     -> single course (public)
 * POST   /Course          -> create course (Admin)
 * PUT    /Course/{id}     -> update course (Admin)
 * DELETE /Course/{id}     -> delete course (Admin)
 */

const courseApi = {
  getAll: async () => {
    return await authAPI.apiCall("/Course", { method: "GET" });
  },

  getById: async (id) => {
    return await authAPI.apiCall(`/Course/${id}`, { method: "GET" });
  },

  create: async (payload) => {
    return await authAPI.apiCall("/Course", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  },

  update: async (id, payload) => {
    return await authAPI.apiCall(`/Course/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  },

  remove: async (id) => {
    return await authAPI.apiCall(`/Course/${id}`, { method: "DELETE" });
  },
};

export default courseApi;