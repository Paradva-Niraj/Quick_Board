// src/pages/FacultyDashboard.jsx - Responsive UI (CSS-only changes) + Notice badge
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import FacultyLayout from "./faculty/FacultyLayout";
import { Plus, FileText, Users, BookOpen, RefreshCw } from "lucide-react";

import useStudents from "../hooks/useStudents";
import useNotices from "../hooks/useNotices";
import useCourses from "../hooks/useCourses";

const StudentList = lazy(() => import("./admin/StudentList"));
const NoticeList = lazy(() => import("./admin/NoticeList"));
const NoticeForm = lazy(() => import("./faculty/NoticeForm"));
const FacultyProfileForm = lazy(
  () => import("./faculty/FacultyProfileForm")
);

export default function FacultyDashboard() {
  // Initialize user state from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : {};
    } catch {
      return {};
    }
  });

  // Listen for localStorage changes from other tabs/windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        try {
          const newUserData = e.newValue ? JSON.parse(e.newValue) : {};
          setCurrentUser(newUserData);
        } catch {
          console.error("Error parsing user data from localStorage");
        }
      }
      // If noticeCountSeen changed in another tab, we might want to re-render badge:
      if (e.key === "noticeCountSeen") {
        // trigger a state update by reading nothing — we will rely on stats/allNotices computed value
        // simpler approach: force a small state flip (no-op). We'll not add extra state here to keep logic minimal.
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Helper function to update both localStorage and state
  const updateCurrentUser = useCallback((updatedUser) => {
    try {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  }, []);

  // Extract user info with fallbacks
  const facultyId = currentUser?.id ?? currentUser?.FacultyId ?? null;
  const userName =
    currentUser?.name ??
    currentUser?.FacultyName ??
    currentUser?.AdminName ??
    "Faculty";
  const userEmail =
    currentUser?.mail ?? currentUser?.email ?? currentUser?.FacultyMail ?? "";

  // Hooks
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
    approveStudent,
    deleteStudent,
  } = useStudents();
  const {
    notices,
    loading: noticesLoading,
    error: noticesError,
    refresh: refreshNotices,
    deleteNotice,
    count: noticesCount, // if your hook exposes `count` or `count` alias; if not, it's okay — fallback used below
  } = useNotices({ limit: 20 });
  const { courses } = useCourses();

  // UI State
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Computed values
  const myNotices = useMemo(() => {
    if (!Array.isArray(notices)) return [];
    return notices.filter((n) => {
      const authorId =
        n.NoticeWrittenBy ?? n.noticeWrittenBy ?? n.authorId;
      return Number(authorId) === Number(facultyId);
    });
  }, [notices, facultyId]);

  const stats = useMemo(
    () => ({
      myNotices: myNotices.length,
      students: Array.isArray(students) ? students.length : 0,
      courses: Array.isArray(courses) ? courses.length : 0,
      allNotices: Array.isArray(notices) ? notices.length : 0,
    }),
    [myNotices, students, courses, notices]
  );

  // Helper: read seen count safely
  const getSeenNoticeCount = useCallback(() => {
    try {
      const v = localStorage.getItem("noticeCountSeen");
      if (v === null) return null; // differentiate "absent" vs zero
      const n = Number(v);
      return Number.isNaN(n) ? 0 : n;
    } catch {
      return 0;
    }
  }, []);

  // Initialize noticeCountSeen at first login / first load if missing
  useEffect(() => {
    try {
      const existing = localStorage.getItem("noticeCountSeen");
      if (existing === null) {
        // Use the best available total: prefer noticesCount if provided by hook, else stats.allNotices
        const total = typeof noticesCount === "number" ? noticesCount : stats.allNotices;
        localStorage.setItem("noticeCountSeen", String(total ?? 0));
      }
    } catch (e) {
      // ignore storage errors
      console.error("Failed to initialize noticeCountSeen:", e);
    }
    // We only want to run this after notices (or noticesCount) are known:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* run when component mounts; intentionally leave deps minimal */]);

  // Mark notices as seen when viewing all notices
  useEffect(() => {
    if (active === "all-notices") {
      const total = typeof noticesCount === "number" ? noticesCount : (Array.isArray(notices) ? notices.length : null);
      if (total !== null) {
        try {
          localStorage.setItem("noticeCountSeen", String(total));
        } catch (e) {
          // ignore
        }
      }
    }
  }, [active, notices, noticesCount]);

  // Enhanced refresh function
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshNotices();
    } catch (error) {
      console.error("Error refreshing notices:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshNotices]);

  // Event handlers
  const handleApproveStudent = useCallback(
    async (studentId) => {
      if (!facultyId) {
        alert("Faculty ID missing");
        return;
      }

      const res = await approveStudent(studentId, facultyId);
      if (res.success) {
        alert("Student approved successfully");
      } else {
        alert(res.message || "Failed to approve student");
      }
    },
    [approveStudent, facultyId]
  );

  const handleDeleteStudent = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this student?"))
        return;

      const res = await deleteStudent(id);
      if (res.success) {
        alert("Student deleted successfully");
      } else {
        alert(res.message || "Failed to delete student");
      }
    },
    [deleteStudent]
  );

  const handleDeleteNotice = useCallback(
    async (id) => {
      const notice = (notices || []).find(
        (n) => (n.NoticeId ?? n.noticeId ?? n.id) === id
      );
      const authorId =
        notice?.NoticeWrittenBy ?? notice?.noticeWrittenBy ?? null;

      if (Number(authorId) !== Number(facultyId)) {
        alert("You can only delete your own notices.");
        return;
      }

      if (!window.confirm("Are you sure you want to delete this notice?"))
        return;

      const res = await deleteNotice(id);
      if (res.success) {
        alert("Notice deleted successfully");
      } else {
        alert(res.error || "Failed to delete notice");
      }
    },
    [deleteNotice, notices, facultyId]
  );

  // Profile update handler
  const handleProfileSaved = useCallback(
    (updatedUser) => {
      updateCurrentUser(updatedUser);
      setShowProfileModal(false);
      alert("Profile updated successfully!");
    },
    [updateCurrentUser]
  );

  // ✨ SIMPLE: Notice creation handler - just refresh the list
  const handleNoticeCreated = useCallback(
    async () => {
      console.log("Notice created successfully, refreshing list...");

      // Close the modal immediately
      setShowCreate(false);

      // Show success message
      alert("✓ Notice created successfully!");

      // ✨ Simply refresh the notices list to re-render with new data
      setIsRefreshing(true);
      try {
        await refreshNotices();
        console.log("Notice list refreshed successfully");
      } catch (error) {
        console.error("Error refreshing notices:", error);
      } finally {
        setIsRefreshing(false);
      }
    },
    [refreshNotices]
  );

  // Logout handler
  const handleLogout = useCallback(() => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  }, []);

  // Helper to compute badge diff (number of unseen notices)
  const computeNoticeDiff = useCallback(() => {
    const seen = getSeenNoticeCount();
    // If seen === null (absent) treat as 0, but we initialize on mount so usually not null
    const seenVal = seen === null ? 0 : seen;
    const total = typeof noticesCount === "number" ? noticesCount : (Array.isArray(notices) ? notices.length : 0);
    const diff = Math.max(0, (Number(total) || 0) - Number(seenVal || 0));
    return diff;
  }, [getSeenNoticeCount, notices, noticesCount]);

  return (
    <FacultyLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onLogout={handleLogout}
      activeItem={active}
      onNavClick={setActive}
      userName={userName}
    >
      <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex-shrink-0">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {userName?.charAt(0)?.toUpperCase() ?? "F"}
              </div>
            </div>

            <div className="truncate">
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                {userName}
              </h1>
              <div className="text-sm text-gray-500 truncate">
                {userEmail}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end w-full sm:w-auto">
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors flex-1 sm:flex-none justify-center"
              aria-label="Create Notice"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Notice</span>
              <span className="sm:hidden">Create</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md transition-colors ${
                isRefreshing
                  ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </span>
              <span className="sm:hidden">
                {isRefreshing ? "..." : "R"}
              </span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          {/* Overview Panel */}
          {active === "overview" && (
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                Dashboard Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="relative p-4 sm:p-5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm hover:shadow-lg transform transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90">My Notices</div>
                      <div className="text-2xl sm:text-3xl font-bold">
                        {stats.myNotices}
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* notification badge for new notices */}
                  {(() => {
                    const diff = computeNoticeDiff();
                    if (diff > 0) {
                      return (
                        <div className="absolute top-3 right-3">
                          <div className="inline-flex items-center justify-center px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full min-w-[26px]">
                            {diff}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="p-4 sm:p-5 rounded-lg bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-sm hover:shadow-lg transform transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90">Students</div>
                      <div className="text-2xl sm:text-3xl font-bold">
                        {stats.students}
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-sm hover:shadow-lg transform transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90">Courses</div>
                      <div className="text-2xl sm:text-3xl font-bold">
                        {stats.courses}
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Panel */}
          {active === "students" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Manage Students</h3>
              <Suspense fallback={<div className="text-center py-4">Loading students...</div>}>
                <StudentList
                  students={students}
                  loading={studentsLoading}
                  error={studentsError}
                  onApprove={handleApproveStudent}
                  onDelete={handleDeleteStudent}
                />
              </Suspense>
            </div>
          )}

          {/* My Notices Panel */}
          {active === "my-notices" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h3 className="text-lg font-semibold">My Notices</h3>
                <div className="text-sm text-gray-500">
                  {stats.myNotices} notice{stats.myNotices !== 1 ? "s" : ""}
                  {isRefreshing && (
                    <span className="ml-2 text-blue-600">Refreshing...</span>
                  )}
                </div>
              </div>
              <Suspense fallback={<div className="text-center py-4">Loading notices...</div>}>
                <NoticeList
                  notices={myNotices}
                  loading={noticesLoading || isRefreshing}
                  error={noticesError}
                  onDelete={handleDeleteNotice}
                />
              </Suspense>
            </div>
          )}

          {/* All Notices Panel */}
          {active === "all-notices" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <h3 className="text-lg font-semibold">All Notices</h3>
                <div className="text-sm text-gray-500">
                  {stats.allNotices} notice{stats.allNotices !== 1 ? "s" : ""}
                  {isRefreshing && (
                    <span className="ml-2 text-blue-600">Refreshing...</span>
                  )}
                </div>
              </div>
              <Suspense fallback={<div className="text-center py-4">Loading notices...</div>}>
                <NoticeList
                  notices={notices}
                  loading={noticesLoading || isRefreshing}
                  error={noticesError}
                  onDelete={handleDeleteNotice}
                />
              </Suspense>
            </div>
          )}

          {/* Profile Panel */}
          {active === "profile" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">My Profile</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Name</div>
                    <div className="font-medium text-gray-900">
                      {userName || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="font-medium text-gray-900">
                      {userEmail || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Faculty ID
                    </div>
                    <div className="font-medium text-gray-900">
                      {facultyId || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <Suspense fallback={null}>
          {/* Create Notice Modal */}
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
              <div className="relative w-full max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-lg z-10 max-h-[90vh]">
                <NoticeForm
                  onClose={() => setShowCreate(false)}
                  onCreated={handleNoticeCreated}
                />
              </div>
            </div>
          )}

          {/* Profile Edit Modal */}
          {showProfileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowProfileModal(false)} />
              <div className="relative w-full max-w-lg mx-auto bg-white rounded-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Edit Profile</h3>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                    aria-label="Close edit profile"
                  >
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>

                <FacultyProfileForm
                  initial={{
                    id: facultyId,
                    FacultyId: facultyId,
                    name: userName,
                    FacultyName: userName,
                    mail: userEmail,
                    email: userEmail,
                    FacultyMail: userEmail,
                  }}
                  onCancel={() => setShowProfileModal(false)}
                  onSaved={handleProfileSaved}
                />
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </FacultyLayout>
  );
}