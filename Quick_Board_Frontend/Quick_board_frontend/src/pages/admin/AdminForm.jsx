// src/pages/admin/AdminForm.jsx
import React, { useState, useEffect } from "react";

/*
  AdminForm keeps its own local state for inputs so typing is stable and won't
  be interrupted by parent re-renders. onSubmit receives { name, mail, password }.
*/
export default function AdminForm({ initial = null, onSubmit, onCancel, saving, error }) {
  const [form, setForm] = useState({
    AdminName: "",
    AdminMail: "",
    AdminPassword: "",
  });

  useEffect(() => {
    if (initial) {
      setForm({
        AdminName: initial.adminName || initial.AdminName || "",
        AdminMail: initial.adminMail || initial.AdminMail || "",
        AdminPassword: "",
      });
    } else {
      setForm({ AdminName: "", AdminMail: "", AdminPassword: "" });
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // local validation
    if (!form.AdminName || !form.AdminMail) {
      return; // optionally show local validation
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="AdminName" className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          id="AdminName"
          name="AdminName"
          type="text"
          value={form.AdminName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          placeholder="Enter admin name"
          autoComplete="off"
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="AdminMail" className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          id="AdminMail"
          name="AdminMail"
          type="email"
          value={form.AdminMail}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          placeholder="Enter admin email"
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="AdminPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="AdminPassword"
          name="AdminPassword"
          type="password"
          value={form.AdminPassword}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
          placeholder={initial ? "Leave empty to keep current password" : "Enter admin password"}
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {saving ? "Saving..." : initial ? "Update Admin" : "Add Admin"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}