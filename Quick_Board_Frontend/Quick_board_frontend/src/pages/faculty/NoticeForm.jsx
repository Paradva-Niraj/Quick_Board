// src/pages/faculty/NoticeForm.jsx
import React, { useState } from "react";
import noticeApi from "../../api/noticeApi";

export default function NoticeForm({ initial = null, onClose, onCreated }) {
  const [title, setTitle] = useState(initial?.NoticeTitle ?? initial?.title ?? "");
  const [description, setDescription] = useState(initial?.NoticeDescription ?? initial?.description ?? "");
  const [image, setImage] = useState(initial?.Image ?? initial?.image ?? "");
  const [file, setFile] = useState(initial?.File ?? initial?.file ?? "");
  const [isPinned, setIsPinned] = useState(Boolean(initial?.IsPinned ?? initial?.isPinned ?? false));
  const [priority, setPriority] = useState(Number(initial?.Priority ?? initial?.priority ?? 1));
  const [saving, setSaving] = useState(false);

  // load current user id robustly
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const facultyId = currentUser?.id ?? currentUser?.FacultyId ?? currentUser?.facultyId ?? null;

  // create/update submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // payload keys matching backend expectation - adjust names if backend uses different ones
      const payload = {
        NoticeTitle: title,
        NoticeDescription: description,
        Image: image || null,
        File: file || null,
        IsPinned: Boolean(isPinned),
        Priority: Number(priority),
        NoticeWrittenBy: facultyId,
      };

      if (initial && (initial.NoticeId || initial.id)) {
        // update
        const id = initial.NoticeId ?? initial.id;
        await noticeApi.update(id, payload);
        alert("Notice updated");
      } else {
        // create
        await noticeApi.create(payload);
        alert("Notice created");
      }

      onCreated && onCreated(); // parent will refresh list / close modal
      onClose && onClose();
    } catch (err) {
      console.error("Notice save error:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to save notice";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">{initial ? "Edit Notice" : "Create Notice"}</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="relative">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"
              placeholder=" "
              required
            />
            <label className="absolute left-3 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base">
              Title
            </label>
          </div>

          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none resize-none"
              placeholder=" "
              required
            />
            <label className="absolute left-3 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base">
              Description
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">Image URL (optional)</label>
              <input value={image} onChange={(e) => setImage(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 focus:border-blue-500 outline-none" />
              {image && (
                <div className="mt-3 rounded-lg overflow-hidden border">
                  <img src={image} alt="preview" className="h-32 w-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">File URL (optional)</label>
              <input value={file} onChange={(e) => setFile(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 focus:border-blue-500 outline-none" />
              {file && (
                <div className="mt-2 text-sm text-blue-600 underline">
                  <a href={file} target="_blank" rel="noopener noreferrer">View File</a>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} className="rounded border-gray-300 text-blue-600" />
              <span className="text-sm text-gray-700">Pin notice</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Priority</label>
              <select value={priority} onChange={(e) => setPriority(Number(e.target.value))} className="border border-gray-300 rounded-lg px-2 py-1 outline-none">
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:opacity-90 transition disabled:opacity-50">
              {saving ? "Saving..." : (initial ? "Save Changes" : "Create Notice")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
