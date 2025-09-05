// src/pages/admin/StudentList.jsx
import React, { useState, useMemo, useCallback } from "react";
import { Search, Check, Trash2, User } from "lucide-react";

/*
  StudentList with tabs filter: All | Approved | Remaining
  Shows ApprovedByFaculty (name) and ApprovedBy (id) together.
*/

const StudentRow = React.memo(function StudentRow({ student, onApprove, onDelete, canApprove }) {
  const id = student.StudentId ?? student.studentId ?? student.id ?? null;
  const name = student.StudentName ?? student.studentName ?? student.name ?? "";
  const mail = student.StudentMail ?? student.studentMail ?? student.mail ?? "";
  const approvedByName = student.ApprovedByFaculty ?? student.approvedByFaculty ?? null;
  const approvedById = student.ApprovedBy ?? student.approvedBy ?? null;
  const pending = (student.RequestStatus ?? student.requestStatus) === false;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 lg:px-6 py-4">
        <div className="flex items-center">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
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
        {approvedByName || approvedById ? (
          <div className="text-sm text-gray-800">
            {approvedByName && <div className="truncate">{approvedByName}</div>}
            {approvedById && <div className="text-xs text-gray-600 mt-1">#{approvedById}</div>}
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>

      <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {pending && canApprove && (
            <button
              onClick={() => id !== null && onApprove(id)}
              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-all duration-200"
              aria-label="Approve student"
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => id !== null && onDelete(id)}
            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
            aria-label="Delete student"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function StudentList({ students = [], loading, error, onApprove, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all | approved | pending

  // determine if current user can approve (faculty role)
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const canApprove = (currentUser?.role ?? currentUser?.Role ?? "").toString().toLowerCase() === "faculty";
  const currentFacultyId = currentUser?.id ?? currentUser?.FacultyId ?? null;

  const counts = useMemo(() => {
    const total = Array.isArray(students) ? students.length : 0;
    let approved = 0;
    let pending = 0;
    (students || []).forEach((s) => {
      const isApproved = !!(s.RequestStatus ?? s.requestStatus);
      if (isApproved) approved++;
      else pending++;
    });
    return { total, approved, pending };
  }, [students]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let source = students || [];

    if (filter === "approved") {
      source = source.filter((s) => !!(s.RequestStatus ?? s.requestStatus));
    } else if (filter === "pending") {
      source = source.filter((s) => !(s.RequestStatus ?? s.requestStatus));
    }

    if (!term) return source;

    return source.filter((s) => {
      const name = (s.StudentName ?? s.studentName ?? "").toString().toLowerCase();
      const email = (s.StudentMail ?? s.studentMail ?? "").toString().toLowerCase();
      const id = (s.StudentId ?? s.studentId ?? s.id ?? "").toString().toLowerCase();
      return name.includes(term) || email.includes(term) || id.includes(term);
    });
  }, [students, searchTerm, filter]);

  const handleApprove = useCallback(
    async (studentId) => {
      if (!canApprove) {
        alert("Only faculty can approve students.");
        return;
      }
      if (!window.confirm("Approve this student?")) return;
      const facultyId = currentFacultyId;
      if (!facultyId) {
        alert("Unable to determine your faculty id. Please re-login.");
        return;
      }
      await onApprove(studentId, facultyId);
    },
    [onApprove, canApprove, currentFacultyId]
  );

  const handleDelete = useCallback(
    (id) => {
      if (!window.confirm("Are you sure you want to delete this student?")) return;
      onDelete(id);
    },
    [onDelete]
  );

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manage Students</h1>
          {/* <p className="text-gray-600">View, approve (faculty) and remove students</p> */}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
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

          <div className="w-full sm:w-80">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search students..."
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Student</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Approved By</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((s) => {
                  const key = s.StudentId ?? s.studentId ?? s.id ?? (s.StudentMail ?? s.studentMail ?? Math.random());
                  return <StudentRow key={key} student={s} onApprove={handleApprove} onDelete={handleDelete} canApprove={canApprove} />;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}