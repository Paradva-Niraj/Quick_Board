// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {authService} from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load current user from authService (e.g., localStorage or token)
    try {
      const stored = authService.getCurrentUser?.();
      if (stored) setUser(stored);
    } catch (err) {
      console.error("Failed to load current user:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...updates };
      try {
        authService.saveCurrentUser?.(next);
      } catch (err) {
        console.warn("Failed to persist user:", err);
      }
      return next;
    });
  };

  const replaceUser = (newUser) => {
    setUser(newUser);
    try {
      authService.saveCurrentUser?.(newUser);
    } catch (err) {
      console.warn("Failed to persist user:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser: replaceUser, updateUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};