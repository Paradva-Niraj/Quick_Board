// src/layouts/StudentLayout.jsx
import React from "react";
import { Menu, X, LogOut, FileText, User, Bell } from "lucide-react";

/**
 * StudentLayout
 * Props:
 * - sidebarOpen (bool)
 * - setSidebarOpen (fn)
 * - onLogout (fn)
 * - activeItem (string)
 * - onNavClick (fn) -> receives id
 * - userName (string)
 * - children (node)
 */
export default function StudentLayout({
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  activeItem = "overview",
  onNavClick = () => {},
  userName = "Student",
  children,
}) {
  const navItems = [
    { id: "overview", label: "Overview", icon: User },
    { id: "my-notices", label: "My Notices", icon: FileText },
    { id: "profile", label: "My Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-100
                    transition-transform duration-200 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-5 flex items-center gap-3 border-b border-gray-100">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold">
              {userName?.charAt(0)?.toUpperCase() ?? "S"}
            </div>
            <div>
              <div className="text-sm font-semibold">{userName}</div>
              <div className="text-xs text-gray-500">Student</div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const ActiveIcon = item.icon;
              const active = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ActiveIcon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-100">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Page content wrapper */}
      <div className="flex-1 lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="text-lg font-semibold">Student Dashboard</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavClick("my-notices")}
                title="Notices"
                className="relative p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <Bell className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex sm:items-center sm:gap-3">
                <div className="text-sm text-gray-600">Hello,</div>
                <div className="text-sm font-medium">{userName}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}