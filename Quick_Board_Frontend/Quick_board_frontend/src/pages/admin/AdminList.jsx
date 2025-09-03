// src/pages/admin/AdminList.jsx
import React, { useState, useMemo, useCallback } from "react";
import { Users, Search, Edit3, Trash2, User } from "lucide-react";

/*
  AdminList component: local search state, memoized filteredAdmins and
  memoized admin row component so typing is stable and won't be affected
  by parent-level state changes.

  Change: exclude currently logged-in admin from the displayed list.
*/

const AdminRow = React.memo(function AdminRow({ admin, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 lg:px-6 py-4">
        <div className="flex items-center">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div className="ml-3 lg:ml-4 min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {admin.adminName || admin.AdminName || "Unknown"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
        <div className="truncate max-w-xs">
          {admin.adminMail || admin.AdminMail || "No email"}
        </div>
      </td>
      <td className="px-4 lg:px-6 py-4 text-sm text-gray-500">
        #{admin.adminId || admin.AdminId || "N/A"}
      </td>
      <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onEdit(admin)}
            className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            aria-label="Edit admin"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(admin.adminId || admin.AdminId)}
            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
            aria-label="Delete admin"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function AdminList({ admins, loading, error, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");

  // determine current user id from localStorage to exclude from list
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {
      return {};
    }
  }, []);

  const currentAdminId = currentUser?.AdminId || currentUser?.adminId || currentUser?.id || null;

  // memoize filtered list so re-renders are minimized
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const source = admins || [];

    // exclude current admin
    const withoutSelf = source.filter((a) => {
      const id = a.adminId || a.AdminId || a.id;
      return id !== currentAdminId;
    });

    if (!term) return withoutSelf;
    return withoutSelf.filter((a) => {
      const name = (a.adminName || a.AdminName || "").toLowerCase();
      const email = (a.adminMail || a.AdminMail || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [admins, searchTerm, currentAdminId]);

  const handleEdit = useCallback((admin) => {
    onEdit(admin);
  }, [onEdit]);

  const handleDelete = useCallback((id) => {
    onDelete(id);
  }, [onDelete]);

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manage Admins</h1>
          <p className="text-gray-600">Add, edit, and manage admin accounts</p>
        </div>

        <div className="w-full sm:w-auto max-w-sm">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-4 text-gray-600">Loading admins...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Admin</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((admin) => (
                  <AdminRow key={admin.adminId || admin.AdminId} admin={admin} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}