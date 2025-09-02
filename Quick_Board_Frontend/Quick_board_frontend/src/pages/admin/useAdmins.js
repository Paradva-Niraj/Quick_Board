// src/pages/admin/useAdmins.js
import { useState, useCallback, useEffect } from "react";
import { authAPI } from "../../api/authApi";

/*
  Hook encapsulating admin CRUD and loading/error states.
  Exposes stable callbacks (useCallback) so components can consume
  functions without causing unnecessary re-renders.
*/
export default function useAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authAPI.apiCall("/Admin", { method: "GET" });
      // normalize response -> array
      if (Array.isArray(data)) setAdmins(data);
      else if (data && Array.isArray(data.admins)) setAdmins(data.admins);
      else setAdmins([]);
    } catch (err) {
      console.error("fetchAll admins error:", err);
      setError(err.message || "Failed to fetch admins");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addAdmin = useCallback(
    async (payload) => {
      setLoading(true);
      setError("");
      try {
        await authAPI.apiCall("/Admin", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await fetchAll();
        return { success: true };
      } catch (err) {
        console.error("addAdmin error:", err);
        setError(err.message || "Failed to add admin");
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  const updateAdmin = useCallback(
    async (id, payload) => {
      setLoading(true);
      setError("");
      try {
        await authAPI.apiCall(`/Admin/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        await fetchAll();
        return { success: true };
      } catch (err) {
        console.error("updateAdmin error:", err);
        setError(err.message || "Failed to update admin");
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  const deleteAdmin = useCallback(
    async (id) => {
      setLoading(true);
      setError("");
      try {
        await authAPI.apiCall(`/Admin/${id}`, {
          method: "DELETE",
        });
        await fetchAll();
        return { success: true };
      } catch (err) {
        console.error("deleteAdmin error:", err);
        setError(err.message || "Failed to delete admin");
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  return {
    admins,
    loading,
    error,
    fetchAll,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    setError,
  };
}