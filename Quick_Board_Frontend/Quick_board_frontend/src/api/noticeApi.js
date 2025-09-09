// src/api/noticeApi.js
import { authAPI } from "./authApi";

/*
  Notice API wrapper with pagination support
  GET /Notice?before=2025-01-02T15:04:05Z&limit=20
  GET /Notice/count
  DELETE /Notice/{id}
*/

const noticeApi = {
  getAll: async (opts = {}) => {
    const { before, limit } = opts;
    const qs = [];
    if (before) qs.push(`before=${encodeURIComponent(new Date(before).toISOString())}`);
    if (limit) qs.push(`limit=${encodeURIComponent(limit)}`);
    const query = qs.length ? `?${qs.join("&")}` : "";
    return await authAPI.apiCall(`/Notice${query}`, { method: "GET" });
  },

  getCount: async () => {
    return await authAPI.apiCall("/Notice/count", { method: "GET" });
  },

  delete: async (id) => {
    return await authAPI.apiCall(`/Notice/${id}`, { method: "DELETE" });
  },

  create: async (payload) => {
    return await authAPI.apiCall("/Notice", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  },

  update: async (id, payload) => {
    return await authAPI.apiCall(`/Notice/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  },
};

export default noticeApi;
