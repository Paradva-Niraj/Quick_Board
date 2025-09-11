// src/pages/faculty/NoticeForm.jsx
import React, { useState } from "react";
import noticeApi from "../../api/noticeApi";

export default function NoticeForm({ initial = null, onClose, onCreated }) {
  const [title, setTitle] = useState(initial?.NoticeTitle ?? "");
  const [description, setDescription] = useState(initial?.NoticeDescription ?? "");
  const [image, setImage] = useState(initial?.Image ?? "");
  const [file, setFile] = useState(initial?.File ?? "");
  const [isPinned, setIsPinned] = useState(Boolean(initial?.IsPinned ?? false));
  const [priority, setPriority] = useState(Number(initial?.Priority ?? 1));

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modes: for both image and file we allow "upload" or "url"
  const [imageMode, setImageMode] = useState(initial?.Image ? "url" : "upload"); // "upload" | "url"
  const [fileMode, setFileMode] = useState(initial?.File ? "url" : "upload"); // "upload" | "url"
  const [imageUrlInput, setImageUrlInput] = useState(initial?.Image ?? "");
  const [fileUrlInput, setFileUrlInput] = useState(initial?.File ?? "");

  // current user
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const facultyId = currentUser?.id ?? currentUser?.FacultyId ?? null;
  const rawRole = currentUser?.role ?? currentUser?.AuthorType ?? null;
  const authorType = rawRole?.toLowerCase() === "admin" ? "Admin" : "Faculty";

  // helper: upload file to Cloudinary (auto resource type)
  async function uploadToCloudinary(fileObj, folder = "notices") {
    setUploading(true);
    try {
      const url = `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME
      }/auto/upload`;

      const formData = new FormData();
      formData.append("file", fileObj);
      formData.append("upload_preset", import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folder);

      const res = await fetch(url, { method: "POST", body: formData });
      if (!res.ok) {
        const text = await res.text();
        throw new Error("Upload failed: " + text);
      }
      const data = await res.json();
      // return whole response so caller can inspect data.resource_type, secure_url, public_id, etc.
      return data;
    } finally {
      setUploading(false);
    }
  }

  // Helper to handle image file selection (upload) or URL input
  const handleImageFile = async (fileObj) => {
    if (!fileObj) return;
    try {
      const data = await uploadToCloudinary(fileObj, "notices/images");
      // store secure_url only
      setImage(data.secure_url);
      setImageUrlInput(data.secure_url);
      setImageMode("url"); // keep preview via URL
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Image upload failed: " + (err.message || err));
    }
  };

  // Helper to handle generic file selection (upload) or URL input
  const handleGenericFile = async (fileObj) => {
    if (!fileObj) return;
    try {
      const data = await uploadToCloudinary(fileObj, "notices/files");
      setFile(data.secure_url);
      setFileUrlInput(data.secure_url);
      setFileMode("url");
    } catch (err) {
      console.error("File upload error:", err);
      alert("File upload failed: " + (err.message || err));
    }
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) {
      alert("Please wait for file uploads to finish.");
      return;
    }

    setSaving(true);
    try {
      if (!facultyId) {
        alert("No logged user id found. Please login again.");
        return;
      }

      // final image/file values:
      const finalImage = imageMode === "url" ? (imageUrlInput || image || null) : image || null;
      const finalFile = fileMode === "url" ? (fileUrlInput || file || null) : file || null;

      const payload = {
        NoticeTitle: title,
        NoticeDescription: description,
        Image: finalImage || null,
        File: finalFile || null,
        IsPinned: Boolean(isPinned),
        Priority: Number(priority),
        NoticeWrittenBy: Number(facultyId),
        AuthorType: authorType,
      };

      if (initial?.NoticeId) {
        await noticeApi.update(initial.NoticeId, payload);
        alert("Notice updated");
      } else {
        await noticeApi.create(payload);
        alert("Notice created");
      }

      onCreated && onCreated();
      onClose && onClose();
    } catch (err) {
      console.error("Notice save error:", err);
      alert(err?.response?.data?.message || err.message || "Failed to save notice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">
            {initial ? "Edit Notice" : "Create Notice"}
          </h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:border-blue-500 outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:border-blue-500 outline-none resize-none"
              required
            />
          </div>

          {/* Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image: choose Upload or URL */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Image (optional)</label>

              <div className="mt-2 flex items-center gap-3">
                <label className={`px-3 py-1 rounded-md cursor-pointer ${imageMode === "upload" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                  <input
                    type="radio"
                    name="imageMode"
                    value="upload"
                    checked={imageMode === "upload"}
                    onChange={() => setImageMode("upload")}
                    className="hidden"
                  />
                  Upload
                </label>

                <label className={`px-3 py-1 rounded-md cursor-pointer ${imageMode === "url" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                  <input
                    type="radio"
                    name="imageMode"
                    value="url"
                    checked={imageMode === "url"}
                    onChange={() => setImageMode("url")}
                    className="hidden"
                  />
                  Use URL
                </label>
              </div>

              <div className="mt-3">
                {imageMode === "upload" ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) await handleImageFile(f);
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                ) : (
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                )}
              </div>

              {/* Preview */}
              { (imageMode === "url" ? imageUrlInput || image : image) ? (
                <div className="mt-3 rounded-lg overflow-hidden border">
                  <img
                    src={imageMode === "url" ? (imageUrlInput || image) : image}
                    alt="preview"
                    className="h-32 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            {/* File: choose Upload or URL */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Attachment (optional)</label>

              <div className="mt-2 flex items-center gap-3">
                <label className={`px-3 py-1 rounded-md cursor-pointer ${fileMode === "upload" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                  <input
                    type="radio"
                    name="fileMode"
                    value="upload"
                    checked={fileMode === "upload"}
                    onChange={() => setFileMode("upload")}
                    className="hidden"
                  />
                  Upload
                </label>

                <label className={`px-3 py-1 rounded-md cursor-pointer ${fileMode === "url" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                  <input
                    type="radio"
                    name="fileMode"
                    value="url"
                    checked={fileMode === "url"}
                    onChange={() => setFileMode("url")}
                    className="hidden"
                  />
                  Use URL
                </label>
              </div>

              <div className="mt-3">
                {fileMode === "upload" ? (
                  <input
                    type="file"
                    // allow any file type; Cloudinary will accept as raw if preset allows
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) await handleGenericFile(f);
                    }}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                ) : (
                  <input
                    type="url"
                    placeholder="https://example.com/doc.pdf"
                    value={fileUrlInput}
                    onChange={(e) => setFileUrlInput(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                )}
              </div>

              { (fileMode === "url" ? fileUrlInput || file : file) && (
                <div className="mt-2 text-sm text-blue-600 underline">
                  <a href={fileMode === "url" ? (fileUrlInput || file) : file} target="_blank" rel="noopener noreferrer">
                    View File
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Pin + Priority */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-700">Pin notice</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-2 py-1 outline-none"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : saving
                ? "Saving..."
                : initial
                ? "Save Changes"
                : "Create Notice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}