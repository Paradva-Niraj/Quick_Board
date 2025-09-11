// src/pages/StudentDashboard.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import StudentLayout from "./student/StudentLayout";
import { FileText, RefreshCw, User, Edit2, Save } from "lucide-react";
import NoticeList from "./admin/NoticeList";
import useNotices from "../hooks/useNotices";

// Read user from localStorage safely
function readLocalUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function StudentDashboard() {
  const localUser =
    readLocalUser() || { id: null, name: "Student", mail: "", role: "Student" };
  const [currentUser, setCurrentUser] = useState(localUser);
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    id: currentUser?.id ?? null,
    name: currentUser?.name ?? "",
    mail: currentUser?.mail ?? "",
    password: "",
  });

  const {
    notices,
    loading: noticesLoading,
    error: noticesError,
    refresh: refreshNotices,
    count: noticesCount,
  } = useNotices({ limit: 50 });

  const visibleNotices = useMemo(
    () => (Array.isArray(notices) ? notices : []),
    [notices]
  );

  // Initialize noticeCountSeen if absent
  useEffect(() => {
    try {
      const existing = localStorage.getItem("noticeCountSeen");
      if (existing === null) {
        const total =
          typeof noticesCount === "number"
            ? noticesCount
            : visibleNotices.length;
        localStorage.setItem("noticeCountSeen", String(total ?? 0));
      }
    } catch (e) {
      console.error("init noticeCountSeen failed", e);
    }
  }, [noticesCount, visibleNotices]);

  const computeNoticeDiff = useCallback(() => {
    try {
      const v = localStorage.getItem("noticeCountSeen");
      const seen = v === null ? 0 : Number(v) || 0;
      const total =
        typeof noticesCount === "number" ? noticesCount : visibleNotices.length;
      return Math.max(0, (Number(total) || 0) - Number(seen || 0));
    } catch {
      return 0;
    }
  }, [noticesCount, visibleNotices.length]);

  const handleNavClick = useCallback(
    (id) => {
      setActive(id);
      if (id === "my-notices") {
        try {
          const total =
            typeof noticesCount === "number"
              ? noticesCount
              : visibleNotices.length;
          localStorage.setItem("noticeCountSeen", String(total ?? 0));
        } catch { }
      }
    },
    [noticesCount, visibleNotices.length]
  );

  // keep form in sync with current user
  useEffect(() => {
    setProfileForm((p) => ({
      ...p,
      id: currentUser?.id ?? p.id,
      name: currentUser?.name ?? p.name,
      mail: currentUser?.mail ?? p.mail,
    }));
  }, [currentUser]);

  const handleProfileChange = (field, value) =>
    setProfileForm((s) => ({ ...s, [field]: value }));

  const API_BASE = import.meta.env.VITE_API_BASE_URL; // loaded from .env

  const apiCall = async (url, options = {}) => {
    const headers = options.headers || {};
    headers["Content-Type"] = "application/json";
    const token = localStorage.getItem("authToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // ✅ always prepend API_BASE
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

    const res = await fetch(fullUrl, { ...options, headers });
    const text = await res.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (!res.ok) throw new Error(body?.message || body || `HTTP ${res.status}`);
    return body;
  };
  const handleSaveProfile = async () => {
    if (!profileForm.name || !profileForm.mail) {
      alert("Name and email are required");
      return;
    }
    const id = profileForm.id;
    if (!id) {
      alert("Student id missing");
      return;
    }

    const payload = {
      ...(profileForm.name ? { StudentName: profileForm.name } : {}),
      ...(profileForm.mail ? { StudentMail: profileForm.mail } : {}),
      ...(profileForm.password ? { StudentPassword: profileForm.password } : {}),
    };

    try {
      const updated = await apiCall(`/Student/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const newLocal = {
        id: updated?.StudentId ?? currentUser.id,
        name: updated?.StudentName ?? profileForm.name,
        mail: updated?.StudentMail ?? profileForm.mail,
        role: "Student",
      };
      localStorage.setItem("user", JSON.stringify(newLocal));
      setCurrentUser(newLocal);
      setEditing(false);
      setProfileForm((s) => ({ ...s, password: "" }));
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Failed to update profile: " + (err.message || err));
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotices();
    } catch (err) {
      console.error("refresh failed", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkSeen = () => {
    try {
      const total =
        typeof noticesCount === "number" ? noticesCount : visibleNotices.length;
      localStorage.setItem("noticeCountSeen", String(total ?? 0));
      refreshNotices().catch(() => { });
    } catch { }
  };

  const handleDeleteNotice = null;

  return (
    <StudentLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onLogout={() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }}
      activeItem={active}
      onNavClick={handleNavClick}
      userName={currentUser?.name ?? "Student"}
    >
      <div className="flex justify-center">
        <div className="hidden lg:block w-1/12" aria-hidden />
        <main className="w-full lg:w-10/12 max-w-screen-lg space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg">
                {(currentUser?.name || "S").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {currentUser?.name || "Student"}
                </div>
                <div className="text-sm text-gray-500">
                  {currentUser?.mail || ""}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm bg-white"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button
                onClick={() => setEditing((s) => !s)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm"
              >
                <Edit2 className="w-4 h-4" />
                <span>{editing ? "Cancel" : "Edit Profile"}</span>
              </button>
            </div>
          </div>

          {/* Profile Card */}
          <section className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Logged in as</div>
                  <div className="text-lg font-semibold">
                    {currentUser?.name || "Student"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentUser?.mail}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Role: <span className="font-medium">Student</span>
              </div>
            </div>

            {editing && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => handleProfileChange("name", e.target.value)}
                  className="col-span-1 border px-3 py-2 rounded"
                  placeholder="Full name"
                />
                <input
                  type="email"
                  value={profileForm.mail}
                  onChange={(e) => handleProfileChange("mail", e.target.value)}
                  className="col-span-1 border px-3 py-2 rounded"
                  placeholder="Email"
                />
                <input
                  type="password"
                  value={profileForm.password}
                  onChange={(e) =>
                    handleProfileChange("password", e.target.value)
                  }
                  className="col-span-1 md:col-span-2 border px-3 py-2 rounded"
                  placeholder="New password (leave blank to keep current)"
                />
                <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setProfileForm((p) => ({ ...p, password: "" }));
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Notices */}
          <section className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Notices
                </div>
                <div className="text-sm text-gray-500">
                  {visibleNotices.length} notice
                  {visibleNotices.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {computeNoticeDiff() > 0 && (
                  <div className="inline-flex items-center px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                    {computeNoticeDiff()} new
                  </div>
                )}
                <button
                  onClick={handleMarkSeen}
                  className="text-sm text-blue-600 underline"
                >
                  Mark seen
                </button>
              </div>
            </div>

            <NoticeList
              notices={visibleNotices}
              loading={noticesLoading}
              error={noticesError}
              onDelete={handleDeleteNotice}
              onRefresh={refreshNotices}
              showFilters={true}
              showSearch={true}
            />
          </section>
        </main>
        <div className="hidden lg:block w-1/12" aria-hidden />
      </div>
    </StudentLayout>
  );
}
