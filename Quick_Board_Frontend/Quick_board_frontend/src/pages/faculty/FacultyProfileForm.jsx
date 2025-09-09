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
    setForm((f) => ({ ...f, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.FacultyName || !form.FacultyMail) {
      setError("Name and email are required");
      return;
    }
    setSaving(true);
    try {
      // call backend: PUT /Faculty/{id}
      const id = initial?.id ?? initial?.FacultyId ?? initial?.facultyId;
      if (!id) throw new Error("Unable to determine faculty id");
      const payload = {
        FacultyName: form.FacultyName,
        FacultyMail: form.FacultyMail,
        FacultyPassword: form.FacultyPassword || null,
      };
      await facultyApi.update(id, payload);

      // update localStorage user object (keep role)
      try {
        const raw = localStorage.getItem("user");
        const u = raw ? JSON.parse(raw) : {};
        const merged = { ...(u || {}), name: form.FacultyName, mail: form.FacultyMail };
        localStorage.setItem("user", JSON.stringify(merged));
      } catch (e) { /* ignore */ }

      onSaved?.();
    } catch (err) {
      console.error("profile save error:", err);
      setError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          name="FacultyName"
          value={form.FacultyName}
          onChange={handleChange}
          className="mt-1 block w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          name="FacultyMail"
          value={form.FacultyMail}
          onChange={handleChange}
          className="mt-1 block w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">New Password (optional)</label>
        <input
          name="FacultyPassword"
          type="password"
          value={form.FacultyPassword}
          onChange={handleChange}
          className="mt-1 block w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}