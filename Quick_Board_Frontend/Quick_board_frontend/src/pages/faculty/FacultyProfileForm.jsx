// src/pages/faculty/FacultyProfileForm.jsx
import React, { useState, useEffect } from "react";
import facultyApi from "../../api/facultyApi";

export default function FacultyProfileForm({ initial, onCancel, onSaved }) {
  const [form, setForm] = useState({
    FacultyName: initial?.FacultyName ?? initial?.name ?? "",
    FacultyMail: initial?.FacultyMail ?? initial?.mail ?? initial?.email ?? "",
    FacultyPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      FacultyName: initial?.FacultyName ?? initial?.name ?? "",
      FacultyMail: initial?.FacultyMail ?? initial?.mail ?? initial?.email ?? "",
      FacultyPassword: "",
    });
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const facultyId = initial?.id ?? initial?.FacultyId;
      if (!facultyId) {
        throw new Error("Faculty ID not found");
      }

      // Prepare payload - only include password if provided
      const payload = {
        FacultyName: form.FacultyName.trim(),
        FacultyMail: form.FacultyMail.trim(),
      };

      // Only include password if user entered one
      if (form.FacultyPassword.trim()) {
        payload.FacultyPassword = form.FacultyPassword.trim();
      }

      // Call API to update faculty
      const response = await facultyApi.update(facultyId, payload);

      if (response.success) {
        // Create updated user object with the new data
        const updatedUser = {
          ...initial,
          id: facultyId,
          FacultyId: facultyId,
          name: payload.FacultyName,
          FacultyName: payload.FacultyName,
          mail: payload.FacultyMail,
          email: payload.FacultyMail,
          FacultyMail: payload.FacultyMail,
        };

        // Call onSaved with the updated user data
        onSaved(updatedUser);
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          name="FacultyName"
          value={form.FacultyName}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          name="FacultyMail"
          type="email"
          value={form.FacultyMail}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          New Password 
          <span className="text-gray-500 font-normal">(leave blank to keep current password)</span>
        </label>
        <input
          name="FacultyPassword"
          type="password"
          value={form.FacultyPassword}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter new password (optional)"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={saving}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={saving || !form.FacultyName.trim() || !form.FacultyMail.trim()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}