// src/services/authService.js
export const authService = {
  setToken(token) {
    localStorage.setItem("authToken", token);
  },

  getToken() {
    return localStorage.getItem("authToken");
  },

  removeToken() {
    localStorage.removeItem("authToken");
  },

  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  },

  getUserRole() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    } catch (error) {
      this.removeToken();
      return null;
    }
  },

  // helper to save current user object
  saveCurrentUser(user) {
    try {
      localStorage.setItem("user", JSON.stringify(user));
    } catch (e) { /* ignore */ }
  },

  getCurrentUser() {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
};