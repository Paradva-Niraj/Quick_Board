// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";

import {
  Users,
  UserPlus,
  BookOpen,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Plus,
  Clock,
  User,
  Menu,
  X,
} from "lucide-react";

import AdminLayout from "./admin/AdminLayout";
import AdminList from "./admin/AdminList";
import AdminModal from "./admin/AdminModal";
import AdminForm from "./admin/AdminForm";
import useAdmins from "./admin/useAdmins";
import { authAPI } from "../api/authApi"; // used for fetching current admin after update

import useFaculty from "../hooks/useFaculty";
import FacultyList from "./admin/FacultyList";

import useStudents from "../hooks/useStudents";
import StudentList from "./admin/StudentList";

import useCourses from "../hooks/useCourses";
import CourseList from "./admin/CourseList";

import useNotices from "../hooks/useNotices";
import NoticeList from "./admin/NoticeList";

// mockCounts kept for overview demo (you can replace with real API calls)
const mockCounts = {
  faculty: 25,
  students: 150,
  notices: 12,
  courses: 8,
};

// utility: friendly time-ago string for recent activity
function timeAgoString(date) {
  const now = Date.now();
  const diff = Math.max(0, now - date.getTime());
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

const PlaceholderContent = ({ title }) => (
  <div className="p-4 lg:p-6">
    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">{title}</h1>
    <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 text-center">
      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Settings className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
      </div>
      <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">{title} Management</h3>
      <p className="text-gray-500">This section is under development. Coming soon!</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  // admin data & operations
  const { admins, loading, error, addAdmin, updateAdmin, deleteAdmin, setError } = useAdmins();
  const { faculties, loading: facultyLoading, error: facultyError, approveFaculty, deleteFaculty } = useFaculty();
  const { students, loading: studentLoading, error: studentError, approveStudent, deleteStudent } = useStudents();
  const { courses, loading: courseLoading, error: courseError, createCourse, updateCourse, deleteCourse } = useCourses();
  // useNotices hook - expects it to return count (number) and deleteNotice, refresh etc.
  const { notices, loading: noticeLoading, error: noticeError, count: noticesCount, refresh: refreshNotices, deleteNotice,count } = useNotices();
  const [noticeCount, setNoticeCount] = useState(null);

  // UI state
  const [activeComponent, setActiveComponent] = useState("dashboard"); // 'dashboard' | 'admins' | 'faculty' | ...
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // modal state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // profile (manage self) modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // first login welcome
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    const lastLogin = localStorage.getItem("lastLogin");
    if (!lastLogin) {
      setIsFirstLogin(true);
      localStorage.setItem("lastLogin", new Date().toISOString());
    }
  }, []);

  // Use the numeric count from the hook (not as a function)
  useEffect(() => {
    try {
      const seen = localStorage.getItem("noticeCountSeen");
      if (seen === null) {
        const countToStore = (typeof noticeCount === "number"
          ? noticeCount
          : Array.isArray(notices)
            ? notices.length
            : 0);

        localStorage.setItem("noticeCountSeen", String(countToStore));
      }
    } catch { }
  }, [noticeCount, notices]);

  // Load authoritative current admin info from backend (fallback to localStorage)
  // FIXED: Preserve role information when updating from backend
  useEffect(() => {
    let mounted = true;
    const loadCurrentAdmin = async () => {
      try {
        const raw = localStorage.getItem("user");
        if (!raw) {
          if (mounted) setCurrentAdmin(null);
          return;
        }

        const localUser = JSON.parse(raw);
        const id = localUser.AdminId || localUser.adminId || localUser.id;
        if (!id) {
          // no id in local storage, keep the raw user object
          if (mounted) setCurrentAdmin(localUser);
          return;
        }

        // fetch the authoritative admin record from backend
        try {
          const backendAdmin = await authAPI.apiCall(`/Admin/${id}`, { method: "GET" });
          if (mounted && backendAdmin) {
            // Start with localUser
            const mergedUser = { ...localUser };

            // Add backend fields only if not already present
            Object.entries(backendAdmin).forEach(([key, value]) => {
              if (mergedUser[key] === undefined || mergedUser[key] === null) {
                mergedUser[key] = value;
              }
            });

            // Explicit handling for common fields
            mergedUser.role = localUser.role || "Admin";
            mergedUser.id = localUser.id ?? backendAdmin.AdminId ?? backendAdmin.adminId;
            mergedUser.name = localUser.name ?? backendAdmin.AdminName ?? backendAdmin.adminName;
            mergedUser.mail = localUser.mail ?? backendAdmin.AdminMail ?? backendAdmin.adminMail;
            mergedUser.email = localUser.email ?? backendAdmin.AdminMail ?? backendAdmin.adminMail;

            setCurrentAdmin(mergedUser);
            localStorage.setItem("user", JSON.stringify(mergedUser));
          }
        } catch (err) {
          console.error("Failed to fetch admin from backend:", err);
          if (mounted) setCurrentAdmin(localUser);
        }
      } catch (e) {
        console.error("Error loading current admin:", e);
        if (mounted) setCurrentAdmin(null);
      }
    };

    loadCurrentAdmin();
    return () => {
      mounted = false;
    };
  }, []);

  // logout handler
  const handleLogout = useCallback(() => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.setItem("lastLogin", new Date().toISOString());
      window.location.href = "/login";
    }
  }, []);

  // Admin actions (wrapped to be stable)
  const handleOpenEdit = useCallback((admin) => {
    setSelectedAdmin(admin);
    setShowEditAdminModal(true);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this admin?")) return;
      const res = await deleteAdmin(id);
      if (!res.success) {
        console.error(res.error);
      }
    },
    [deleteAdmin]
  );

  const handleAddSubmit = useCallback(
    async (form) => {
      const res = await addAdmin(form);
      if (res.success) setShowAddAdminModal(false);
    },
    [addAdmin]
  );

  const handleEditSubmit = useCallback(
    async (form) => {
      if (!selectedAdmin) return;
      const id = selectedAdmin.adminId || selectedAdmin.AdminId;
      const res = await updateAdmin(id, form);
      if (res.success) {
        setShowEditAdminModal(false);
        setSelectedAdmin(null);
      }
    },
    [selectedAdmin, updateAdmin]
  );

  const closeModals = useCallback(() => {
    setShowAddAdminModal(false);
    setShowEditAdminModal(false);
    setSelectedAdmin(null);
    setShowProfileModal(false);
    setError("");
  }, [setError]);

  // handle profile (manage self) submit - reuse updateAdmin and refresh current admin
  // FIXED: Preserve role when updating profile
  const handleProfileSubmit = useCallback(
    async (form) => {
      const id = currentAdmin?.AdminId || currentAdmin?.adminId || currentAdmin?.id;
      if (!id) {
        alert("Unable to determine your admin id.");
        return;
      }

      const res = await updateAdmin(id, form);
      if (res.success) {
        // Fetch updated admin from backend to ensure AdminMail/AdminName are authoritative
        try {
          const updated = await authAPI.apiCall(`/Admin/${id}`, { method: "GET" });
          if (updated) {
            // FIXED: Preserve role when updating after profile change
            const mergedUser = {
              ...currentAdmin, // Keep existing data (including role)
              ...updated, // Override with fresh backend data
              role: currentAdmin.role || "Admin", // Explicitly preserve role
              id: updated.AdminId || updated.adminId || currentAdmin.id,
              name: updated.AdminName || updated.adminName || currentAdmin.name,
              mail: updated.AdminMail || updated.adminMail || currentAdmin.mail,
              email: updated.AdminMail || updated.adminMail || currentAdmin.email
            };

            localStorage.setItem("user", JSON.stringify(mergedUser));
            setCurrentAdmin(mergedUser);
          }
        } catch (err) {
          console.error("Failed to refresh admin after profile update:", err);
          // fallback: update locally while preserving role
          const fallback = {
            ...currentAdmin,
            AdminName: form.AdminName,
            AdminMail: form.AdminMail,
            name: form.AdminName,
            mail: form.AdminMail,
            email: form.AdminMail
          };
          localStorage.setItem("user", JSON.stringify(fallback));
          setCurrentAdmin(fallback);
        }
        setShowProfileModal(false);
      } else {
        // updateAdmin sets hook error; we don't close modal on failure
        console.error("Profile update failed", res.error);
      }
    },
    [currentAdmin, updateAdmin]
  );

  // Sidebar navigation items
  const navItems = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard", icon: Settings },
      { id: "admins", label: "Manage Admins", icon: Users },
      { id: "faculty", label: "Faculty", icon: UserPlus },
      { id: "students", label: "Students", icon: GraduationCap },
      { id: "notices", label: "Notices", icon: FileText },
      { id: "courses", label: "Courses", icon: BookOpen },
    ],
    []
  );

  //  Helper: read seen count from localStorage
  const getSeenNoticeCount = useCallback(() => {
    try {
      const v = localStorage.getItem("noticeCountSeen");
      return v === null ? 0 : Number(v) || 0;
    } catch {
      return 0;
    }
  }, []);

  // Handler for navigation clicks so we can clear notice badge when visiting notices
  const handleNavClick = useCallback((id) => {
    if (id === "notices") {
      // mark all notices as seen: prefer noticeCount (from state) else fallback to notices length
      const countToStore = (typeof noticeCount === "number" ? noticeCount : (Array.isArray(notices) ? notices.length : 0));
      try {
        localStorage.setItem("noticeCountSeen", String(countToStore));
      } catch (e) {
        // ignore
      }
    }
    setActiveComponent(id);
  }, [noticeCount, notices]);

  // If activeComponent becomes "notices" by any other flow, clear seen count too
  useEffect(() => {
    if (activeComponent === "notices") {
      const countToStore = (typeof noticeCount === "number" ? noticeCount : (Array.isArray(notices) ? notices.length : 0));
      try {
        localStorage.setItem("noticeCountSeen", String(countToStore));
      } catch { }
    }
  }, [activeComponent, noticeCount, notices]);

  // Renderers for content
  const DashboardContent = () => {
    // read user + last login from localStorage (or use currentAdmin)
    const rawUser = localStorage.getItem("user");
    let userObj = {};
    try {
      userObj = rawUser ? JSON.parse(rawUser) : {};
    } catch (e) {
      userObj = currentAdmin || {};
    }
    const lastLoginRaw = localStorage.getItem("lastLogin");
    const lastLogin = lastLoginRaw ? new Date(lastLoginRaw) : null;

    const recent = [
      {
        id: "login",
        title: "Last LogOut",
        detail: lastLogin ? lastLogin.toLocaleString() : "No record",
        icon: Clock,
        timeAgo: lastLogin ? timeAgoString(lastLogin) : "",
      },
      {
        id: "profile",
        title: "Profile",
        detail: userObj.AdminName || userObj.adminName || userObj.name || "Admin",
        icon: User,
        timeAgo: "",
        link: "true"
      },

      {
        id: "adminsCount",
        title: "Admins Managed",
        detail: Array.isArray(admins) ? `${admins.length} admins` : "—",
        icon: Users,
        timeAgo: "",
      },
    ];

    return (
      <div className="p-4 lg:p-6">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">Dashboard Overview</h1>
            <p className="text-gray-600">
              Welcome back{" "}
              {userObj.role && <span className="text-gray-500"> ({userObj.role})</span>}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Profile / Manage Myself button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:shadow-md transition-all"
              title="Manage my profile"
            >
              <User className="w-5 h-5 text-gray-600" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800 truncate" style={{ maxWidth: 160 }}>
                  {userObj.AdminName || userObj.adminName || userObj.name || "Admin"}
                </div>
                <div className="text-xs text-gray-400">
                  {lastLogin ? `Last logOut: ${lastLogin.toLocaleString()}` : ""}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {[
            { label: "Faculty", count: Array.isArray(faculties) ? faculties.length : mockCounts.faculty, icon: UserPlus, color: "from-green-500 to-emerald-600" },
            { label: "Students", count: Array.isArray(students) ? students.length : mockCounts.students, icon: GraduationCap, color: "from-blue-500 to-indigo-600" },
            { label: "Notices", count: noticeCount ?? (Array.isArray(notices) ? notices.length : mockCounts.notices), icon: FileText, color: "from-purple-500 to-violet-600" },
            { label: "Courses", count: Array.isArray(courses) ? courses.length : mockCounts.courses, icon: BookOpen, color: "from-orange-500 to-red-600" },
          ].map((item, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300 ${item.label === 'Notices' ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (item.label === "Notices") {
                  // mark seen when clicking the card
                  try {
                    const countToStore = (typeof noticeCount === "number" ? noticeCount : (Array.isArray(notices) ? notices.length : 0));
                    localStorage.setItem("noticeCountSeen", String(countToStore));
                  } catch { }
                  setActiveComponent("notices");
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{item.label}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800 mt-1">{item.count}</p>
                </div>
                <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                  <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>

              {/* notification badge for Notices card */}
              {item.label === "Notices" && (() => {
                const seen = getSeenNoticeCount();
                const total = item.count ?? 0;
                const diff = Math.max(0, Number(total) - Number(seen));
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
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <r.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium truncate">{r.title}</p>
                  <p className="text-gray-500 text-sm truncate">{r.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{r.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AdminsContent = () => (
    <div>
      <AdminList
        admins={admins}
        loading={loading}
        error={error}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onAdd={() => setShowAddAdminModal(true)} // Add this line
      />
    </div>
  );

  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <DashboardContent />;
      case "admins":
        return <AdminsContent />;
      case "faculty":
        return (
          <FacultyList
            faculties={faculties}
            loading={facultyLoading}
            error={facultyError}
            onApprove={async (facultyId) => {
              // pick admin id from current admin stored in localStorage "user"
              const raw = localStorage.getItem("user");
              let adminId = null;
              try {
                const u = raw ? JSON.parse(raw) : null;
                adminId = u?.AdminId || u?.adminId || u?.id || null;
              } catch (e) {
                adminId = null;
              }
              if (!adminId) {
                alert("Unable to determine admin id. Please ensure you are logged in as admin.");
                return;
              }
              const res = await approveFaculty(facultyId, adminId);
              if (!res.success) {
                alert("Failed to approve faculty: " + (res.error?.message || "Unknown"));
              }
            }}
            onDelete={async (id) => {
              if (!window.confirm("Are you sure you want to delete this faculty?")) return;
              const res = await deleteFaculty(id);
              if (!res.success) {
                alert("Failed to delete faculty: " + (res.error?.message || "Unknown"));
              }
            }}
          />
        );
      case "students":
        return (
          <StudentList
            students={students}
            loading={studentLoading}
            error={studentError}
            onApprove={async (studentId, facultyId) => {
              // approveStudent expects (id, facultyId)
              const res = await approveStudent(studentId, facultyId);
              if (!res.success) {
                alert("Failed to approve student: " + (res.message || res.error?.message || "Unknown"));
              }
            }}
            onDelete={async (id) => {
              if (!window.confirm("Are you sure you want to delete this student?")) return;
              const res = await deleteStudent(id);
              if (!res.success) {
                alert("Failed to delete student: " + (res.message || res.error?.message || "Unknown"));
              }
            }}
          />
        );
      case "notices":
        return (
          <div className="p-5">

            <NoticeList
              notices={notices}
              loading={noticeLoading}
              error={noticeError}
              onDelete={async (id) => {
                // deleteNotice is provided by hook
                const res = await deleteNotice(id);
                if (!res.success) {
                  alert("Failed to delete notice: " + (res.error || "Unknown"));
                }
              }}
            />
          </div>
        );
      case "courses":
        return (
          <CourseList
            courses={courses}
            loading={courseLoading}
            error={courseError}
            createCourse={createCourse}
            updateCourse={updateCourse}
            deleteCourse={deleteCourse}
          />
        );
      default:
        return <DashboardContent />;
    }
  };

  return (
    <AdminLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onLogout={handleLogout}
      activeComponent={activeComponent}
      onNavClick={handleNavClick} // <-- use the handler that clears seen count for notices
      userName={JSON.parse(localStorage.getItem("user") || "{}").name || "Admin"}
    >
      <div className="flex-1 overflow-auto">{renderContent()}</div>

      {/* Add Admin Modal */}
      <AdminModal isOpen={showAddAdminModal} title="Add New Admin" onClose={closeModals}>
        <AdminForm onSubmit={handleAddSubmit} onCancel={closeModals} saving={loading} error={error} />
      </AdminModal>

      {/* Edit Admin Modal */}
      <AdminModal isOpen={showEditAdminModal} title="Edit Admin" onClose={closeModals}>
        <AdminForm initial={selectedAdmin} onSubmit={handleEditSubmit} onCancel={closeModals} saving={loading} error={error} />
      </AdminModal>

      {/* Profile / Manage Myself Modal */}
      <AdminModal isOpen={showProfileModal} title="Manage My Profile" onClose={closeModals}>
        <AdminForm
          initial={
            currentAdmin
              ? {
                AdminId: currentAdmin.AdminId || currentAdmin.adminId || currentAdmin.id,
                AdminName: currentAdmin.AdminName || currentAdmin.adminName || currentAdmin.name || "",
                AdminMail: currentAdmin.AdminMail || currentAdmin.adminMail || currentAdmin.email || "",
              }
              : null
          }
          onSubmit={handleProfileSubmit}
          onCancel={closeModals}
          saving={loading}
          error={error}
        />
      </AdminModal>
    </AdminLayout>
  );
}