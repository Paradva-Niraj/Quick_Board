// src/pages/admin/CourseForm.jsx
import React, { useState, useEffect } from "react";

export default function CourseForm({ initial = null, onSubmit, onCancel, saving, error }) {
  const [name, setName] = useState(initial?.courseName ?? initial?.CourseName ?? "");

  useEffect(() => {
    setName(initial?.courseName ?? initial?.CourseName ?? "");
  }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !name.trim()) return;
    onSubmit({ CourseName: name.trim(), courseName: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="e.g. Computer Science"
          autoFocus
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : initial ? "Update Course" : "Add Course"}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">
          Cancel
        </button>
      </div>
    </form>
  );
}