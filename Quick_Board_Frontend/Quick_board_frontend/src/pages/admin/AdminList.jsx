// src/pages/admin/AdminList.jsx
import React, { useState, useMemo, useCallback } from "react";
import { Users, Search, Edit3, Trash2, User, Plus } from "lucide-react";

/*
  Polished AdminList UI:
  - tighter paddings & margins
  - Add Admin button moved into header, aligned with search
  - role badge next to name
  - Disable delete for currently logged-in admin
  - Stable keys and memoized row
  - Fixed onAdd prop for Add Admin functionality
*/

const AdminRow = React.memo(function AdminRow({ admin, currentAdminId, onEdit, onDelete }) {
  const displayName = admin.adminName || admin.AdminName || "Unknown";
  const displayMail = admin.adminMail || admin.AdminMail || "No email";
  const id = admin.adminId ?? admin.AdminId ?? "N/A";
  const isSelf = currentAdminId && Number(currentAdminId) === Number(admin.adminId ?? admin.AdminId ?? admin.id);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-gray-900 truncate">{displayName}</div>
              <div className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                Admin
              </div>
              {isSelf && (
                <div className="ml-1 text-xs text-blue-600">(You)</div>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate mt-0.5">{displayMail}</div>
          </div>
        </div>
      </td>

      <td className="px-3 py-3 text-sm text-gray-600">#{id}</td>

      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(admin)}
            className="flex items-center gap-2 px-2 py-1 rounded-md text-indigo-600 hover:bg-indigo-50"
            aria-label={`Edit admin ${displayName}`}
            title="Edit"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Edit</span>
          </button>

          <button
            onClick={() => onDelete(admin.adminId ?? admin.AdminId)}
            className={`flex items-center gap-2 px-2 py-1 rounded-md text-red-600 hover:bg-red-50 ${isSelf ? "opacity-40 cursor-not-allowed" : ""}`}
            aria-label={`Delete admin ${displayName}`}
            title={isSelf ? "You cannot delete yourself" : "Delete"}
            disabled={isSelf}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function AdminList({ admins, loading, error, onEdit, onDelete, onAdd }) {
  const [searchTerm, setSearchTerm] = useState("");

  // determine current user id from localStorage to disable self-delete
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

    if (!term) return source;
    return source.filter((a) => {
      const name = (a.adminName || a.AdminName || "").toLowerCase();
      const email = (a.adminMail || a.AdminMail || "").toLowerCase();
      const id = ((a.adminId ?? a.AdminId ?? a.id) + "").toLowerCase();
      return name.includes(term) || email.includes(term) || id.includes(term);
    });
  }, [admins, searchTerm]);

  const handleEdit = useCallback((admin) => {
    onEdit(admin);
  }, [onEdit]);

  const handleDelete = useCallback((id) => {
    onDelete(id);
  }, [onDelete]);

  const handleAdd = useCallback(() => {
    if (onAdd) {
      onAdd();
    }
  }, [onAdd]);

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Admins</h1>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search admins by name, email or id..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoComplete="off"
            />
          </div>

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-700 text-sm"
            title="Add new admin"
            aria-label="Add admin"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Admin</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-3 text-gray-600 text-sm">Loading admins...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-sm text-gray-500 px-3 py-3">Admin</th>
                  <th className="text-left text-sm text-gray-500 px-3 py-3">ID</th>
                  <th className="text-right text-sm text-gray-500 px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((admin) => {
                  const key = admin.adminId ?? admin.AdminId ?? admin.id;
                  return (
                    <AdminRow
                      key={key ?? `admin-${(admin.adminMail || admin.AdminMail || Math.random()).toString()}`}
                      admin={admin}
                      currentAdminId={currentAdminId}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}