// src/pages/FacultyDashboard.jsx
import React, { useMemo, useState, Suspense, lazy } from "react";
import { Plus, User, ClipboardList, FileText } from "lucide-react";
import useStudents from "../hooks/useStudents";
import useNotices from "../hooks/useNotices";

const StudentList = lazy(() => import("./admin/StudentList"));
const NoticeList = lazy(() => import("./admin/NoticeList"));
const NoticeForm = lazy(() => import("./faculty/NoticeForm"));

export default function FacultyDashboard() {
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const facultyId = currentUser?.id ?? currentUser?.FacultyId ?? null;

  // students hook (faculty can approve)
  const { students, loading: studentsLoading, error: studentsError, approveStudent, deleteStudent } = useStudents();

  // notices hook (global paged list)
  const {
    notices,
    loading: noticesLoading,
    error: noticesError,
    fetchPage,
    loadMore,
    refresh,
    deleteNotice,
  } = useNotices({ limit: 20 });

  const [activeTab, setActiveTab] = useState("my-notices"); // 'students' | 'my-notices' | 'all-notices' | 'profile'
  const [showCreateNotice, setShowCreateNotice] = useState(false);

  // derived: my notices (written by this faculty)
  const myNotices = useMemo(() => {
    if (!Array.isArray(notices)) return [];
    return notices.filter((n) => {
      const id = n.NoticeWrittenBy ?? n.noticeWrittenBy ?? n.NoticeWrittenBy;
      return Number(id) === Number(facultyId);
    });
  }, [notices, facultyId]);

  // Handlers
  const handleApproveStudent = async (studentId) => {
    if (!facultyId) {
      window.alert("Unable to determine your faculty id. Please re-login.");
      return;
    }
    const res = await approveStudent(studentId, facultyId);
    if (res.success) window.alert("Student approved");
    else window.alert(res.message || "Approve failed");
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    const res = await deleteStudent(id);
    if (res.success) window.alert("Student deleted");
    else window.alert(res.message || "Delete failed");
  };

  const handleDeleteNotice = async (id) => {
    const noticeObj = (notices || []).find((n) => (n.NoticeId ?? n.noticeId ?? n.id) === id);
    const authorId = noticeObj?.NoticeWrittenBy ?? noticeObj?.noticeWrittenBy ?? noticeObj?.NoticeWrittenBy;
    if (Number(authorId) !== Number(facultyId)) {
      window.alert("You can only delete notices you created.");
      return;
    }
    if (!window.confirm("Delete this notice?")) return;
    const res = await deleteNotice(id);
    if (res.success) window.alert("Notice deleted");
    else window.alert(res.error || "Failed to delete notice");
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Faculty Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your students, notices and profile</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-3 py-1 rounded ${activeTab === "students" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            <ClipboardList className="inline mr-2 w-4 h-4" /> Students
          </button>

          <button
            onClick={() => setActiveTab("my-notices")}
            className={`px-3 py-1 rounded ${activeTab === "my-notices" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            <FileText className="inline mr-2 w-4 h-4" /> My Notices
          </button>

          <button
            onClick={() => setActiveTab("all-notices")}
            className={`px-3 py-1 rounded ${activeTab === "all-notices" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            <FileText className="inline mr-2 w-4 h-4" /> All Notices
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1 rounded ${activeTab === "profile" ? "bg-blue-600 text-white" : "bg-white border"}`}
          >
            <User className="inline mr-2 w-4 h-4" /> Profile
          </button>
        </div>
      </div>

      <div className="mb-6">
        {activeTab === "students" && (
          <Suspense fallback={<div>Loading students...</div>}>
            <StudentList
              students={students}
              loading={studentsLoading}
              error={studentsError}
              onApprove={handleApproveStudent}
              onDelete={handleDeleteStudent}
            />
          </Suspense>
        )}

        {activeTab === "my-notices" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Notices</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateNotice(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded"
                >
                  <Plus className="w-4 h-4" /> New Notice
                </button>
                <button onClick={() => refresh()} className="px-3 py-1 border rounded">Refresh</button>
              </div>
            </div>

            <Suspense fallback={<div>Loading notices...</div>}>
              <NoticeList
                notices={myNotices}
                loading={noticesLoading}
                error={noticesError}
                onDelete={handleDeleteNotice}
              />
            </Suspense>
          </div>
        )}

        {activeTab === "all-notices" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Notices</h2>
              <button onClick={() => refresh()} className="px-3 py-1 border rounded">Refresh</button>
            </div>
            <Suspense fallback={<div>Loading all notices...</div>}>
              <NoticeList
                notices={notices}
                loading={noticesLoading}
                error={noticesError}
                onDelete={handleDeleteNotice}
              />
            </Suspense>
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">My Profile</h2>
            <div className="bg-white rounded p-4 shadow">
              <p><strong>Name:</strong> {currentUser?.name || currentUser?.AdminName || "—"}</p>
              <p><strong>Email:</strong> {currentUser?.mail || currentUser?.email || "—"}</p>
              <p className="mt-3 text-sm text-gray-500">Edit profile feature is under development. Use the Manage Myself button in Admin pages currently.</p>
            </div>
          </div>
        )}
      </div>

      {/* Notice create modal */}
      <Suspense fallback={null}>
        {showCreateNotice && (
          <NoticeForm
            initial={null}
            onClose={() => setShowCreateNotice(false)}
            onCreated={() => {
              setShowCreateNotice(false);
              window.alert("Notice created");
              refresh();
            }}
          />
        )}
      </Suspense>
    </div>
  );
}