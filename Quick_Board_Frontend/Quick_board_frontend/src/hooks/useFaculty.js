// src/pages/admin/useFaculty.js
import { useState, useCallback, useEffect } from "react";
import facultyApi from "../api/facultyApi";

/*
  Hook for managing faculty list and operations.
*/
export default function useFaculty() {
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await facultyApi.getAll();
            // backend returns array or NoContent (null). Normalize.
            if (Array.isArray(data)) setFaculties(data);
            else setFaculties([]);
        } catch (err) {
            console.error("fetchAll faculty error:", err);
            setError(err.message || "Failed to fetch faculties");
            setFaculties([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const approveFaculty = useCallback(
        async (id, adminId) => {
            setLoading(true);
            setError("");
            try {
                await facultyApi.approve(id, adminId);
                await fetchAll();
                return { success: true };
            } catch (err) {
                console.error("approveFaculty error:", err);
                // try read body message (authAPI.apiCall already throws error with .message/.data)
                const message = err.message || err.data?.message || "Failed to approve faculty";
                setError(message);
                return { success: false, error: err, message };
            } finally {
                setLoading(false);
            }
        },
        [fetchAll]
    );

    const deleteFaculty = useCallback(
        async (id) => {
            setLoading(true);
            setError("");
            try {
                await facultyApi.delete(id);
                await fetchAll();
                return { success: true };
            } catch (err) {
                console.error("deleteFaculty error:", err);
                setError(err.message || "Failed to delete faculty");
                return { success: false, error: err };
            } finally {
                setLoading(false);
            }
        },
        [fetchAll]
    );

    return {
        faculties,
        loading,
        error,
        fetchAll,
        approveFaculty,
        deleteFaculty,
        setError,
    };
}