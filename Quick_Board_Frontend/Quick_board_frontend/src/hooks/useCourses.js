// src/hooks/useCourses.js
import { useState, useCallback, useEffect } from "react";
import courseApi from "../api/courseApi";

export default function useCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await courseApi.getAll();
      if (Array.isArray(data)) setCourses(data);
      else setCourses([]);
    } catch (err) {
      console.error("fetchAll courses error:", err);
      setError(err?.message || err?.data?.message || "Failed to fetch courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createCourse = useCallback(
    async (payload) => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        await courseApi.create(payload);
        setSuccess("Course added successfully");
        await fetchAll();
        return { success: true };
      } catch (err) {
        console.error("createCourse error:", err);
        const message = err?.message || err?.data?.message || "Failed to create course";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  const updateCourse = useCallback(
    async (id, payload) => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        await courseApi.update(id, payload);
        setSuccess("Course updated successfully");
        await fetchAll();
        return { success: true };
      } catch (err) {
        console.error("updateCourse error:", err);
        const message = err?.message || err?.data?.message || "Failed to update course";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  const deleteCourse = useCallback(
    async (id) => {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        await courseApi.remove(id);
        setSuccess("Course deleted successfully");
        await fetchAll();
        return { success: true };
      } catch (err) {
        console.error("deleteCourse error:", err);
        const message = err?.message || err?.data?.message || "Failed to delete course";
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [fetchAll]
  );

  return {
    courses,
    loading,
    error,
    success,
    fetchAll,
    createCourse,
    updateCourse,
    deleteCourse,
    setError,
    setSuccess,
  };
}