// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";

import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  BookOpen,
  GraduationCap,
  FileText,
  Settings,
  Bell,
  LogOut,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  Mail,
  User,
  Shield,
  Menu,
  X,
} from "lucide-react";

import AdminLayout from "./admin/AdminLayout";
import AdminList from "./admin/AdminList";
import AdminModal from "./admin/AdminModal";
import AdminForm from "./admin/AdminForm";
import useAdmins from "./admin/useAdmins";
import { authAPI } from "../api/authApi"; // used for other API calls if needed

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

  // UI state
  const [activeComponent, setActiveComponent] = useState("dashboard"); // 'dashboard' | 'admins' | 'faculty' | ...
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // modal state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // first login welcome
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    const lastLogin = localStorage.getItem("lastLogin");
    if (!lastLogin) {
      setIsFirstLogin(true);
      localStorage.setItem("lastLogin", new Date().toISOString());
    }
  }, []);

  // logout handler
  const handleLogout = useCallback(() => {
    if (window.confirm("Are you sure you want to logout?")) {
      // if you had authAPI.logout or a service - call it. We'll clear localStorage and redirect.
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
        // error will be set by hook; optionally show toast
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
    setError("");
  }, [setError]);

  // Sidebar navigation items (keeps the original behavior)
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

  // Renderers for content
  const DashboardContent = () => {
    // read user + last login from localStorage
    const rawUser = localStorage.getItem("user");
    let userObj = {};
    try {
      userObj = rawUser ? JSON.parse(rawUser) : {};
    } catch (e) {
      userObj = {};
    }
    const lastLoginRaw = localStorage.getItem("lastLogin");
    const lastLogin = lastLoginRaw ? new Date(lastLoginRaw) : null;

    // create interactive recent activity entries using local data
    const recent = [
      {
        id: "login",
        title: "Last Login",
        detail: lastLogin ? lastLogin.toLocaleString() : "No record",
        icon: Clock,
        timeAgo: lastLogin ? timeAgoString(lastLogin) : "",
      },
      {
        id: "profile",
        title: "Profile",
        detail: userObj.name || userObj.AdminName || userObj.username || "Admin",
        icon: User,
        timeAgo: "",
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
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
              Dashboard Overview
            </h1>
            <p className="text-gray-600">
              Welcome back,{" "}
              <span className="font-semibold text-blue-600">
                {userObj.name || userObj.AdminName || "Admin"}
              </span>
              .
            </p>
          </div>

          <div className="text-right">
            {/* <p className="text-sm text-gray-500">Signed in as</p> */}
            <p className="text-lg font-semibold text-gray-800">
              {userObj.name || userObj.AdminName || userObj.username || "Admin"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {lastLogin ? `Last login: ${lastLogin.toLocaleString()}` : "No last login recorded"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {[
            {
              label: "Faculty",
              count: mockCounts.faculty,
              icon: UserPlus,
              color: "from-green-500 to-emerald-600",
            },
            {
              label: "Students",
              count: mockCounts.students,
              icon: GraduationCap,
              color: "from-blue-500 to-indigo-600",
            },
            {
              label: "Notices",
              count: mockCounts.notices,
              icon: FileText,
              color: "from-purple-500 to-violet-600",
            },
            {
              label: "Courses",
              count: mockCounts.courses,
              icon: BookOpen,
              color: "from-orange-500 to-red-600",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{item.label}</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-800 mt-1">
                    {item.count}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}
                >
                  <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
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
      {/* top bar with add button */}
      <div className="p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manage Admins</h1>
            <p className="text-gray-600">Add, edit, and manage admin accounts</p>
          </div>
          <div>
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Add Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin list component (search + table) */}
      <AdminList admins={admins} loading={loading} error={error} onEdit={handleOpenEdit} onDelete={handleDelete} />
    </div>
  );

  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        return <DashboardContent />;
      case "admins":
        return <AdminsContent />;
      case "faculty":
        return <PlaceholderContent title="Faculty" />;
      case "students":
        return <PlaceholderContent title="Students" />;
      case "notices":
        return <PlaceholderContent title="Notices" />;
      case "courses":
        return <PlaceholderContent title="Courses" />;
      default:
        return <DashboardContent />;
    }
  };

  // MAIN render
  return (
    <AdminLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      onLogout={handleLogout}
      activeComponent={activeComponent}
      onNavClick={(id) => setActiveComponent(id)}
      userName={(JSON.parse(localStorage.getItem("user") || "{}").name) || (JSON.parse(localStorage.getItem("user") || "{}").AdminName) || "Admin"}
    >
      {/* header for smaller screens / top actions are handled inside AdminLayout; show content */}
      <div className="flex-1 overflow-auto">{renderContent()}</div>

      {/* Add Admin Modal */}
      <AdminModal isOpen={showAddAdminModal} title="Add New Admin" onClose={closeModals}>
        <AdminForm onSubmit={handleAddSubmit} onCancel={closeModals} saving={loading} error={error} />
      </AdminModal>

      {/* Edit Admin Modal */}
      <AdminModal isOpen={showEditAdminModal} title="Edit Admin" onClose={closeModals}>
        <AdminForm initial={selectedAdmin} onSubmit={handleEditSubmit} onCancel={closeModals} saving={loading} error={error} />
      </AdminModal>
    </AdminLayout>
  );
}