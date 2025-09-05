// src/pages/admin/CourseList.jsx
import React, { useState, useMemo, useCallback } from "react";
import { Search, Edit3, Trash2, Plus } from "lucide-react";
import CourseModal from "./CourseModal";
import CourseForm from "./CourseForm";

export default function CourseList({ courses = [], loading, error, createCourse, updateCourse, deleteCourse }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [localError, setLocalError] = useState("");

  const filtered = useMemo(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    if (!term) return courses || [];
    return (courses || []).filter((c) => {
      const name = (c.CourseName ?? c.courseName ?? "").toString().toLowerCase();
      const id = (c.CourseId ?? c.courseId ?? "").toString();
      return name.includes(term) || id.includes(term);
    });
  }, [courses, searchTerm]);

  const openAdd = () => {
    setEditing(null);
    setLocalError("");
    setShowModal(true);
  };
  const openEdit = (course) => {
    setEditing(course);
    setLocalError("");
    setShowModal(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        const id = editing.CourseId ?? editing.courseId;
        const res = await updateCourse(id, { CourseName: payload.CourseName });
        if (res.success) setShowModal(false);
        else setLocalError(res.error || "Update failed");
      } else {
        const res = await createCourse({ CourseName: payload.CourseName });
        if (res.success) setShowModal(false);
        else setLocalError(res.error || "Create failed");
      }
    } catch (err) {
      console.error(err);
      setLocalError(err?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course? This will affect students referencing it.")) return;
    const res = await deleteCourse(id);
    if (!res.success) {
      alert("Failed to delete course: " + (res.error || res.message || "Unknown"));
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manage Courses</h1>
          {/* <p className="text-gray-600">Add, edit, and remove courses</p> */}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-full sm:w-72">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button onClick={openAdd} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-600 hover:to-indigo-700">
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : (filtered || []).length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No courses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Course</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((c) => {
                  const id = c.CourseId ?? c.courseId;
                  return (
                    <tr key={id}>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">{c.CourseName ?? c.courseName}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-500">#{id}</td>
                      <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => openEdit(c)} className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-all duration-200" aria-label="Edit course">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-all duration-200" aria-label="Delete course">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CourseModal isOpen={showModal} title={editing ? "Edit Course" : "Add Course"} onClose={() => setShowModal(false)}>
        <CourseForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
          saving={loading}
          error={localError}
        />
      </CourseModal>
    </div>
  );
}