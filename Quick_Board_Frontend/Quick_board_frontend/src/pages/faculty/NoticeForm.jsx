// src/pages/admin/NoticeForm.jsx
import React, { useState } from "react";
import noticeApi from "../../api/noticeApi";

export default function NoticeForm({ initial = null, onClose, onCreated }) {
  const [title, setTitle] = useState(initial?.NoticeTitle ?? "");
  const [description, setDescription] = useState(initial?.NoticeDescription ?? "");
  const [image, setImage] = useState(initial?.Image ?? "");
  const [file, setFile] = useState(initial?.File ?? "");
  const [isPinned, setIsPinned] = useState(initial?.IsPinned ?? false);
  const [priority, setPriority] = useState(initial?.Priority ?? 1);
  const [saving, setSaving] = useState(false);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  })();
  const facultyId = currentUser?.id ?? currentUser?.FacultyId ?? null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      window.alert("Title and description are required");
      return;
    }
    if (!facultyId) {
      window.alert("Unable to determine faculty id");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        NoticeTitle: title,
        NoticeDescription: description,
        NoticeWrittenBy: facultyId,
        AuthorType: "Faculty",
        Image: image || null,
        File: file || null,
        IsPinned: isPinned,
        Priority: priority
      };
      await noticeApi.create(payload);
      window.alert("Notice created");
      onCreated && onCreated();
    } catch (err) {
      console.error("Create notice error:", err);
      window.alert(err?.message || "Failed to create notice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create Notice</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Image URL (optional)</label>
              <input value={image} onChange={(e) => setImage(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">File URL (optional)</label>
              <input value={file} onChange={(e) => setFile(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
              <span className="text-sm">Pin this notice</span>
            </label>

            <label className="inline-flex items-center gap-2">
              <span className="text-sm">Priority</span>
              <select value={priority} onChange={(e) => setPriority(Number(e.target.value))} className="border rounded px-2 py-1">
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">{saving ? "Saving..." : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}