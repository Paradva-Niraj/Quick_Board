// src/pages/admin/FacultyList.jsx
import React, { useState, useMemo, useCallback } from "react";
import { Search, Check, Trash2, User } from "lucide-react";

/*
  FacultyList with tabs filter: All | Approved | Remaining
  Robust to backend JSON naming (camelCase / PascalCase).
*/

const FacultyRow = React.memo(function FacultyRow({ faculty, onApprove, onDelete }) {
    const id = faculty.FacultyId ?? faculty.facultyId ?? faculty.id ?? faculty.Id ?? null;
    const name = faculty.FacultyName ?? faculty.facultyName ?? faculty.name ?? "";
    const mail = faculty.FacultyMail ?? faculty.facultyMail ?? faculty.mail ?? "";
    const approverName = faculty.AddedByName ?? faculty.addedByName ?? null;
    const approverId = faculty.AddedBy ?? faculty.addedBy ?? null;
    const pending = (faculty.RequestStatus ?? faculty.requestStatus) === false;

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-4 lg:px-6 py-4">
                <div className="flex items-center">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{name || "Unknown"}</div>
                    </div>
                </div>
            </td>

            <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                <div className="truncate max-w-xs">{mail || "No email"}</div>
            </td>

            <td className="px-4 lg:px-6 py-4 text-sm text-gray-500">#{id ?? "N/A"}</td>

            <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">
                {approverName || approverId ? (
                    <span className="text-sm text-gray-800">
                        {approverName && <span>{approverName}</span>}
                        {approverId && (
                            <span className="text-gray-600 ml-2">#{approverId}</span>
                        )}
                    </span>
                ) : (
                    <span className="text-sm text-gray-400">—</span>
                )}
            </td>


            <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                    {pending && (
                        <button
                            onClick={() => id !== null && onApprove(id)}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-all duration-200"
                            aria-label="Approve faculty"
                            title="Approve"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => id !== null && onDelete(id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
                        aria-label="Delete faculty"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
});

export default function FacultyList({ faculties = [], loading, error, onApprove, onDelete }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all"); // 'all' | 'approved' | 'pending'

    // derive counts for tabs
    const counts = useMemo(() => {
        const total = Array.isArray(faculties) ? faculties.length : 0;
        let approved = 0;
        let pending = 0;
        (faculties || []).forEach((f) => {
            const isApproved = !!(f.RequestStatus ?? f.requestStatus);
            if (isApproved) approved += 1;
            else pending += 1;
        });
        return { total, approved, pending };
    }, [faculties]);

    const filtered = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        // base list according to filter
        let source = faculties || [];

        if (filter === "approved") {
            source = source.filter((f) => !!(f.RequestStatus ?? f.requestStatus));
        } else if (filter === "pending") {
            source = source.filter((f) => !(f.RequestStatus ?? f.requestStatus));
        }

        if (!term) return source;

        return source.filter((f) => {
            const name = (f.FacultyName ?? f.facultyName ?? "").toString().toLowerCase();
            const email = (f.FacultyMail ?? f.facultyMail ?? "").toString().toLowerCase();
            const id = (f.FacultyId ?? f.facultyId ?? f.id ?? "").toString().toLowerCase();
            return name.includes(term) || email.includes(term) || id.includes(term);
        });
    }, [faculties, searchTerm, filter]);

    const handleApprove = useCallback((id) => onApprove(id), [onApprove]);
    const handleDelete = useCallback(
        (id) => {
            if (!window.confirm("Are you sure you want to delete this faculty?")) return;
            onDelete(id);
        },
        [onDelete]
    );

    return (
        <div className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manage Faculty</h1>
                    <p className="text-gray-600">Approve or remove faculty accounts</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    {/* Tabs */}
                    <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-sm">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === "all" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                            All <span className="ml-2 inline-block text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium">{counts.total}</span>
                        </button>

                        <button
                            onClick={() => setFilter("approved")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === "approved" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                            Approved <span className="ml-2 inline-block text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium">{counts.approved}</span>
                        </button>

                        <button
                            onClick={() => setFilter("pending")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === "pending" ? "bg-yellow-500 text-white" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                            Remaining <span className="ml-2 inline-block text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-medium">{counts.pending}</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="w-full sm:w-80">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search faculty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all duration-200"
                                autoComplete="off"
                            />
                        </div>
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto" />
                        <p className="mt-4 text-gray-600">Loading faculty...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">No faculty found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Faculty</th>
                                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                                    <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Approved By</th>
                                    <th className="px-4 lg:px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filtered.map((f) => {
                                    const rowKey = f.FacultyId ?? f.facultyId ?? f.id ?? null;
                                    return (
                                        <FacultyRow
                                            key={rowKey ?? `faculty-${(f.FacultyMail ?? f.facultyMail ?? Math.random()).toString()}`}
                                            faculty={f}
                                            onApprove={handleApprove}
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