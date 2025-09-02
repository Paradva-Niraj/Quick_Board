// src/pages/admin/AdminLayout.jsx
import React from "react";
import {
  Menu,
  X,
  LogOut,
  Settings,
  Users,
  UserPlus,
  GraduationCap,
  FileText,
  BookOpen,
} from "lucide-react";

export default function AdminLayout({
  children,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  activeComponent,
  onNavClick,
  userName, // new prop
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Settings },
    { id: "admins", label: "Manage Admins", icon: Users },
    { id: "faculty", label: "Faculty", icon: UserPlus },
    { id: "students", label: "Students", icon: GraduationCap },
    { id: "notices", label: "Notices", icon: FileText },
    { id: "courses", label: "Courses", icon: BookOpen },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200 shadow-sm"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <div className="h-4 w-4 bg-white rounded-sm"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">NoticeBoard</h1>
                <p className="text-xs text-gray-500 -mt-1">Admin Panel</p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 shadow-sm"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-64 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="h-6 w-6 bg-white rounded-md"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">NoticeBoard</h2>
                  <p className="text-sm text-gray-500">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeComponent === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavClick?.(item.id);
                      setSidebarOpen(false); // close on mobile
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:transform hover:scale-105"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:transform hover:scale-105"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* backdrop for mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-gray-200/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        {/* Top-right header (desktop) */}
        <div className="hidden lg:flex items-center justify-end bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">Hello,</div>
            <div className="text-sm font-semibold text-gray-800">{userName || "Admin"}</div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}