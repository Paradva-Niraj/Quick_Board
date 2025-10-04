// src/api/authApi.js
import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL);

// ---------------- Existing Axios-based APIs (Preserved) ----------------
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Faculty registration
export const registerFaculty = async (data) => {
  return await api.post("/Faculty/register", data);
};

// Student registration
export const registerStudent = async (data) => {
  return await api.post("/Student/register", data);
};

// Get all courses
export const getCourses = async () => {
  return await api.get("/Course");
};

// ---------------- Enhanced Auth API Utility ----------------
class AuthAPI {
  constructor() {
    // baseURL normalized without trailing slash
    this.baseURL = API_BASE_URL;
  }

  // normalize endpoint and join with baseURL
  buildUrl(endpoint) {
    if (!endpoint) return this.baseURL;
    // ensure endpoint starts with a single slash
    const ep = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${this.baseURL}${ep}`;
  }

  // Generic fetch-based API call
  async apiCall(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }

    try {
      const response = await fetch(url, config);

      // Try parse JSON safely (some endpoints may return empty body)
      let data = null;
      try {
        data = await response.json();
      } catch (err) {
        // ignore json parse error
        data = null;
      }

      if (!response.ok) {
        // If backend returned structured error with code/message, surface it
        const msg = data?.message || data?.error || `HTTP ${response.status}`;
        const error = new Error(msg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ---------- Auth-specific methods ----------
  // Note: use '/Auth/login' because your backend controller Route is "api/[controller]" where controller is Auth
  async login(credentials) {
    return this.apiCall("/Auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // optional: keep rememberedEmail
    window.location.href = "/login";
  }

  isAuthenticated() {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  }

  getToken() {
    return localStorage.getItem("authToken");
  }

  // Simple client-side validation of JWT expiry (no signature verification)
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;
      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;
      return payload.exp && payload.exp > now;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  async getProfile() {
    return this.apiCall("/Auth/profile");
  }

  async updateProfile(profileData) {
    return this.apiCall("/Auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }
}

// ---------------- Exports ----------------
export const authAPI = new AuthAPI();

// bind methods so `this` is preserved even when destructured
export const login = authAPI.login.bind(authAPI);
export const logout = authAPI.logout.bind(authAPI);
export const isAuthenticated = authAPI.isAuthenticated.bind(authAPI);
export const getCurrentUser = authAPI.getCurrentUser.bind(authAPI);
export const getToken = authAPI.getToken.bind(authAPI);
export const isTokenValid = authAPI.isTokenValid.bind(authAPI);
export const getProfile = authAPI.getProfile.bind(authAPI);
export const updateProfile = authAPI.updateProfile.bind(authAPI);

export default authAPI;