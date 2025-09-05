// src/hooks/useStudents.js
import { useState, useCallback, useEffect } from "react";
import studentApi from "../api/studentApi";

/*
  Hook for managing student list and operations.
*/
export default function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await studentApi.getAll();
      if (Array.isArray(data)) setStudents(data);
      else setStudents([]);
    } catch (err) {
      console.error("fetchAll students error:", err);
      setError(err.message || err.data?.message || "Failed to fetch students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const approveStudent = useCallback(
    async (studentId, facultyId) => {
      setLoading(true);
      setError("");
      try {
        await studentApi.approve(studentId, facultyId);
        await fetchAll();
        return { success: true };
      } catch (err) {
        console.error("approveStudent error:", err);
        const message = err.message || err.data?.message || "Failed to approve student";
        setError(message);
        return { success: false, error: err, message };
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  const deleteStudent = useCallback(
    async (id) => {
      setLoading(true);
      setError("");
      try {
        await studentApi.delete(id);
        await fetchAll();
        return { success: true };
      } catch (err) {
        console.error("deleteStudent error:", err);
        const message = err.message || err.data?.message || "Failed to delete student";
        setError(message);
        return { success: false, error: err, message };
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  return {
    students,
    loading,
    error,
    fetchAll,
    approveStudent,
    deleteStudent,
    setError,
  };
}