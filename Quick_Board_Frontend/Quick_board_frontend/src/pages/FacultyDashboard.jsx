// src/pages/FacultyDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react";
import FacultyLayout from "./faculty/FacultyLayout";
import { Plus, FileText, Users,BookOpen } from "lucide-react";

import useStudents from "../hooks/useStudents";
import useNotices from "../hooks/useNotices";
import useCourses from "../hooks/useCourses";

const StudentList = lazy(() => import("./admin/StudentList"));
const NoticeList = lazy(() => import("./admin/NoticeList"));
// IMPORTANT: ensure NoticeForm exists at src/pages/admin/NoticeForm.jsx (your form)
// earlier you had Form under admin; we import from admin to match that file
const NoticeForm = lazy(() => import("./faculty/NoticeForm"));
const FacultyProfileForm = lazy(() => import("./faculty/FacultyProfileForm")); // optional

function timeAgoString(date) {
  if (!date) return "";
  const now = Date.now();
  const diff = Math.max(0, now - new Date(date).getTime());
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export default function FacultyDashboard() {
  // load user from localStorage but keep it in state so UI updates
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  });

  // Listen for localStorage changes (so if profile form updates localStorage from another tab,
  // the state will update). This also helps when we update localStorage ourselves.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        try { setCurrentUser(JSON.parse(e.newValue || "{}")); } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // helper to update user both in state and localStorage
  const saveCurrentUserLocally = (user) => {
    try {
      localStorage.setItem("user", JSON.stringify(user));
    } catch (e) { /* ignore */ }
    setCurrentUser(user);
  };

  const facultyId = currentUser?.id ?? currentUser?.FacultyId ?? null;
  const name = currentUser?.name ?? currentUser?.AdminName ?? "Faculty";
  const email = currentUser?.mail ?? currentUser?.email ?? "";

  // hooks
  const { students, loading: studentsLoading, error: studentsError, approveStudent, deleteStudent } = useStudents();
  const { notices, loading: noticesLoading, error: noticesError, refresh: refreshNotices, deleteNotice } = useNotices({ limit: 20 });
  const { courses } = useCourses();

  // UI
  const [active, setActive] = useState("overview"); // overview | students | my-notices | all-notices | profile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // derived
  const myNotices = useMemo(() => {
    if (!Array.isArray(notices)) return [];
    return notices.filter(n => Number(n.NoticeWrittenBy ?? n.noticeWrittenBy ?? -1) === Number(facultyId));
  }, [notices, facultyId]);

  const stats = useMemo(() => ({
    myNotices: myNotices.length,
    students: Array.isArray(students) ? students.length : 0,
    courses: Array.isArray(courses) ? courses.length : 0,
    allNotices: Array.isArray(notices) ? notices.length : 0,
  }), [myNotices, students, courses, notices]);

  // When user opens the all-notices tab, mark notices as seen
  useEffect(() => {
    if (active === "all-notices") {
      const total = Array.isArray(notices) ? notices.length : null;
      if (total !== null) localStorage.setItem("noticeCountSeen", String(total));
    }
  }, [active, notices]);

  const handleApproveStudent = useCallback(async (studentId) => {
    const fid = facultyId;
    if (!fid) { alert("Faculty id missing"); return; }
    const res = await approveStudent(studentId, fid);
    if (res.success) alert("Student approved");
    else alert(res.message || "Failed");
  }, [approveStudent, facultyId]);

  const handleDeleteStudent = useCallback(async (id) => {
    if (!window.confirm("Delete student?")) return;
    const res = await deleteStudent(id);
    if (res.success) alert("Student deleted");
    else alert(res.message || "Delete failed");
  }, [deleteStudent]);

  const handleDeleteNotice = useCallback(async (id) => {
    const notice = (notices || []).find(n => (n.NoticeId ?? n.noticeId ?? n.id) === id);
    const authorId = notice?.NoticeWrittenBy ?? notice?.noticeWrittenBy ?? null;
    if (Number(authorId) !== Number(facultyId)) { alert("Only your own notices can be deleted."); return; }
    if (!window.confirm("Delete this notice?")) return;
    const res = await deleteNotice(id);
    if (res.success) alert("Notice deleted");
    else alert(res.error || "Delete failed");
  }, [deleteNotice, notices, facultyId]);

  // Profile save handler: uses faculty update API via facultyApi.update inside FacultyProfileForm
  // We will expect FacultyProfileForm to call saveCurrentUserLocally(updatedUser) when successful
  const handleProfileSaved = (updatedUser) => {
    // update localStorage & state
    saveCurrentUserLocally(updatedUser);
    setShowProfileModal(false);
    alert("Profile updated");
  };

  return (
    <FacultyLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onLogout={() => { if (confirm("Logout?")) { localStorage.removeItem("authToken"); localStorage.removeItem("user"); window.location.href = "/login"; } }}
      activeItem={active}
      onNavClick={setActive}
      userName={name}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {name?.charAt(0)?.toUpperCase() ?? "F"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              <div className="text-sm text-gray-500">{email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded">
              <Plus className="w-4 h-4" /> Create Notice
            </button>
            <button onClick={() => refreshNotices()} className="px-3 py-2 border rounded">Refresh</button>
          </div>
        </div>

        {/* Full width content (no right column) */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="mb-4">
            <nav className="flex items-center gap-2">
              <button onClick={() => setActive("overview")} className={`px-3 py-2 rounded ${active === "overview" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>Overview</button>
              <button onClick={() => setActive("students")} className={`px-3 py-2 rounded ${active === "students" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>Students</button>
              <button onClick={() => setActive("my-notices")} className={`px-3 py-2 rounded ${active === "my-notices" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>My Notices</button>
              <button onClick={() => setActive("all-notices")} className={`px-3 py-2 rounded ${active === "all-notices" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>All Notices</button>
              <button onClick={() => setActive("profile")} className={`px-3 py-2 rounded ${active === "profile" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>Profile</button>
            </nav>
          </div>

          {/* Panels */}
          {active === "overview" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Overview</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform transition hover:scale-102 flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">My Notices</div>
                    <div className="text-3xl font-bold">{myNotices.length}</div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-lg transform transition hover:scale-102 flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Students</div>
                    <div className="text-3xl font-bold">{Array.isArray(students) ? students.length : 0}</div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg transform transition hover:scale-102 flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90">Courses</div>
                    <div className="text-3xl font-bold">{Array.isArray(courses) ? courses.length : 0}</div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "students" && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Manage Students</h3>
              <Suspense fallback={<div>Loading students...</div>}>
                <StudentList students={students} loading={studentsLoading} error={studentsError} onApprove={handleApproveStudent} onDelete={handleDeleteStudent} />
              </Suspense>
            </div>
          )}

          {active === "my-notices" && (
            <div>
              <h3 className="text-lg font-semibold mb-3">My Notices</h3>
              <Suspense fallback={<div>Loading notices...</div>}>
                <NoticeList notices={myNotices} loading={noticesLoading} error={noticesError} onDelete={handleDeleteNotice} />
              </Suspense>
            </div>
          )}

          {active === "all-notices" && (
            <div>
              <h3 className="text-lg font-semibold mb-3">All Notices</h3>
              <Suspense fallback={<div>Loading notices...</div>}>
                <NoticeList notices={notices} loading={noticesLoading} error={noticesError} onDelete={handleDeleteNotice} />
              </Suspense>
            </div>
          )}

          {active === "profile" && (
            <div>
              <h3 className="text-lg font-semibold mb-3">My Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{currentUser?.name ?? "—"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{currentUser?.mail ?? currentUser?.email ?? "—"}</div>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={() => setShowProfileModal(true)} className="px-3 py-1 border rounded">Edit Profile</button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <Suspense fallback={null}>
          {showCreate && <NoticeForm onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); refreshNotices(); alert("Notice created"); }} />}

          {showProfileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-lg w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Profile</h3>
                  <button onClick={() => setShowProfileModal(false)} className="text-gray-500">Close</button>
                </div>

                <Suspense fallback={null}>
                  <FacultyProfileForm
                    initial={{ FacultyName: currentUser?.name, FacultyMail: currentUser?.mail || currentUser?.email, id: currentUser?.id }}
                    onCancel={() => setShowProfileModal(false)}
                    onSaved={(updatedUser) => { setShowProfileModal(false); localStorage.setItem("user", JSON.stringify(updatedUser)); window.location.reload(); }}
                  />
                </Suspense>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </FacultyLayout>
  );
}