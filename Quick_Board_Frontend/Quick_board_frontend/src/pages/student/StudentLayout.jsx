import React from "react";
import { Menu, X, LogOut } from "lucide-react";

/*
  FacultyLayout: similar structure & behavior to AdminLayout.
  Props:
    - children
    - sidebarOpen, setSidebarOpen
    - onLogout
    - activeItem
    - onNavClick
    - userName
*/
export default function FacultyLayout({
  children,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  activeItem,
  onNavClick,
  userName = "Faculty",
}) {
  const navItems = [
    { id: "overview", label: "Overview" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-gray-600 hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Faculty Panel</h1>
              <p className="text-xs text-gray-500">Welcome</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 rounded-xl text-red-600 hover:bg-red-50">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
   ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="h-6 w-6 bg-white rounded-md"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Faculty Panel</h2>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {navItems.map((item) => {
                const active = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavClick?.(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-3">Signed in as</div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-800 truncate">{userName}</div>
              <button onClick={onLogout} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* backdrop for mobile when sidebar open */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-200/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content area */}
      <main className="flex-1 overflow-auto lg:ml-64">
        {/* Top header (desktop) */}
        <div className="hidden lg:flex items-center justify-end bg-white border-b border-gray-200 px-6 py-3">
          <div className="text-sm text-gray-600 mr-3">Hello,</div>
          <div className="text-sm font-semibold text-gray-800">{userName}</div>
        </div>

        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}