// src/pages/StudentDashboard.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import StudentLayout from "./student/StudentLayout"; // <-- new layout
import { FileText, RefreshCw, User, Edit2, Save } from "lucide-react";
import useNotices from "../hooks/useNotices";
import useCourses from "../hooks/useCourses";
import NoticeCard from "./admin/NoticeCard";

function getLocalUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function StudentDashboard() {
  const storedUser = getLocalUser() || { id: null, name: "Student", mail: "", role: "Student" };
  const [currentUser, setCurrentUser] = useState(storedUser);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    id: currentUser?.id ?? null,
    name: currentUser?.name ?? "",
    mail: currentUser?.mail ?? "",
    courseId: currentUser?.StudentCourseId ?? currentUser?.StudentCourseId ?? "",
    password: "",
  });

  const { notices, loading: noticesLoading, error: noticesError, refresh: refreshNotices, count: noticesCount } = useNotices({ limit: 50 });
  const { courses } = useCourses();

  // visible notices for students: show all (read-only)
  const visibleNotices = useMemo(() => Array.isArray(notices) ? notices : [], [notices]);

  // Initialize seen counter on first load if not present
  useEffect(() => {
    try {
      const existing = localStorage.getItem("noticeCountSeen");
      if (existing === null) {
        const total = typeof noticesCount === "number" ? noticesCount : visibleNotices.length;
        localStorage.setItem("noticeCountSeen", String(total ?? 0));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // compute badge diff
  const computeNoticeDiff = useCallback(() => {
    try {
      const v = localStorage.getItem("noticeCountSeen");
      const seen = v === null ? 0 : Number(v) || 0;
      const total = typeof noticesCount === "number" ? noticesCount : visibleNotices.length;
      return Math.max(0, (Number(total) || 0) - Number(seen || 0));
    } catch {
      return 0;
    }
  }, [noticesCount, visibleNotices.length]);

  // profile form handlers
  useEffect(() => {
    setProfileForm((p) => ({
      ...p,
      id: currentUser?.id ?? p.id,
      name: currentUser?.name ?? p.name,
      mail: currentUser?.mail ?? p.mail,
    }));
  }, [currentUser]);

  const handleProfileChange = (field, value) => {
    setProfileForm((s) => ({ ...s, [field]: value }));
  };

  // small helper to call backend
  async function apiCall(url, options = {}) {
    const headers = options.headers || {};
    headers["Content-Type"] = "application/json";
    const token = localStorage.getItem("authToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    if (!res.ok) throw new Error(body?.message || body || `HTTP ${res.status}`);
    return body;
  }

  const handleSaveProfile = async () => {
    if (!profileForm.name || !profileForm.mail) {
      alert("Name and email are required");
      return;
    }

    const id = profileForm.id;
    if (!id) {
      alert("Missing student id");
      return;
    }

    const payload = {
      ...(profileForm.name ? { StudentName: profileForm.name } : {}),
      ...(profileForm.mail ? { StudentMail: profileForm.mail } : {}),
      ...(profileForm.courseId ? { StudentCourseId: Number(profileForm.courseId) } : {}),
      ...(profileForm.password ? { StudentPassword: profileForm.password } : {}),
    };

    try {
      const updated = await apiCall(`/api/Student/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const newLocal = {
        ...currentUser,
        name: updated?.StudentName ?? profileForm.name,
        mail: updated?.StudentMail ?? profileForm.mail,
        StudentCourseId: updated?.StudentCourseId ?? profileForm.courseId,
      };
      localStorage.setItem("user", JSON.stringify(newLocal));
      setCurrentUser(newLocal);
      setEditing(false);
      setProfileForm((p) => ({ ...p, password: "" }));
      alert("Profile updated");
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Failed to update profile: " + (err.message || err));
    }
  };

  // refresh notices
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotices();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // mark seen
  const handleMarkSeen = () => {
    try {
      const total = typeof noticesCount === "number" ? noticesCount : visibleNotices.length;
      localStorage.setItem("noticeCountSeen", String(total ?? 0));
    } catch {}
  };

  return (
    <StudentLayout
      sidebarOpen={false}
      setSidebarOpen={() => {}}
      onLogout={() => { localStorage.removeItem("authToken"); localStorage.removeItem("user"); window.location.href = "/login"; }}
      activeItem={"overview"}
      onNavClick={() => {}}
      userName={currentUser?.name ?? "Student"}
    >
      <div className="flex justify-center p-6">
        <div className="hidden lg:block w-1/12" aria-hidden />
        <main className="w-full lg:w-10/12 max-w-screen-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                {(currentUser?.name || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold">{currentUser?.name || "Student"}</div>
                <div className="text-sm text-gray-500">{currentUser?.mail || ""}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleRefresh} disabled={isRefreshing} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button onClick={() => setEditing((s) => !s)} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm">
                <Edit2 className="w-4 h-4" />
                <span>{editing ? "Cancel" : "Edit Profile"}</span>
              </button>
            </div>
          </div>

          {/* Profile card */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Logged in as</div>
                  <div className="text-lg font-semibold">{currentUser?.name || "Student"}</div>
                  <div className="text-sm text-gray-500">{currentUser?.mail}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">Role: <span className="font-medium">Student</span></div>
            </div>

            {editing && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" value={profileForm.name} onChange={(e) => handleProfileChange("name", e.target.value)} className="col-span-1 md:col-span-1 border px-3 py-2 rounded" placeholder="Full name" />
                <input type="email" value={profileForm.mail} onChange={(e) => handleProfileChange("mail", e.target.value)} className="col-span-1 md:col-span-1 border px-3 py-2 rounded" placeholder="Email" />
                <select value={profileForm.courseId || ""} onChange={(e) => handleProfileChange("courseId", e.target.value || "")} className="col-span-1 md:col-span-1 border px-3 py-2 rounded">
                  <option value="">Select course (optional)</option>
                  {(courses || []).map((c) => <option key={c.CourseId ?? c.id} value={c.CourseId ?? c.id}>{c.CourseName ?? c.name}</option>)}
                </select>

                <input type="password" value={profileForm.password} onChange={(e) => handleProfileChange("password", e.target.value)} className="col-span-1 md:col-span-2 border px-3 py-2 rounded" placeholder="New password (leave blank to keep current)" />

                <div className="col-span-1 md:col-span-1 flex items-center gap-2">
                  <button onClick={handleSaveProfile} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"><Save className="w-4 h-4" /> Save</button>
                  <button onClick={() => { setEditing(false); setProfileForm((p) => ({ ...p, password: "" })); }} className="px-4 py-2 border rounded">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Notices */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5" /> Notices</div>
                <div className="text-sm text-gray-500">{visibleNotices.length} notice{visibleNotices.length !== 1 ? "s" : ""}</div>
              </div>

              <div className="flex items-center gap-3">
                {computeNoticeDiff() > 0 && <div className="inline-flex items-center px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">{computeNoticeDiff()} new</div>}
                <button onClick={handleMarkSeen} className="text-sm text-blue-600 underline">Mark seen</button>
              </div>
            </div>

            {noticesLoading ? (
              <div className="text-center py-8 text-gray-600">Loading notices...</div>
            ) : noticesError ? (
              <div className="text-red-600">{String(noticesError)}</div>
            ) : visibleNotices.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No notices</div>
            ) : (
              <div className="space-y-3">
                {visibleNotices.map((n) => <NoticeCard key={n.NoticeId ?? n.noticeId ?? n.id} notice={n} />)}
              </div>
            )}
          </div>
        </main>

        <div className="hidden lg:block w-1/12" aria-hidden />
      </div>
    </StudentLayout>
  );
}