// src/pages/faculty/FacultyNoticeList.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Plus, RefreshCw, FileText } from "lucide-react";
import NoticeCard from "../admin/NoticeCard";
import useNotices from "../../hooks/useNotices";

function friendlyDateHeading(date) {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  const diffDays = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))/ (1000*60*60*24));
  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

function groupByDate(notices) {
  const groups = [];
  const map = new Map();
  for (const n of notices) {
    const published = n.PublishedAt ?? n.publishedAt ?? n.NoticeDate ?? n.createdAt;
    const d = published ? new Date(published) : null;
    const key = d ? d.toISOString().slice(0,10) : "unknown";
    if (!map.has(key)) {
      const heading = friendlyDateHeading(d);
      map.set(key, { key, heading, items: [] });
      groups.push(map.get(key));
    }
    map.get(key).items.push(n);
  }

  groups.forEach(g => {
    g.items.sort((a, b) => {
      const pa = !!(a.IsPinned ?? a.isPinned);
      const pb = !!(b.IsPinned ?? b.isPinned);
      if (pa && !pb) return -1;
      if (!pa && pb) return 1;
      const da = new Date(a.PublishedAt ?? a.publishedAt ?? a.NoticeDate ?? a.createdAt);
      const db = new Date(b.PublishedAt ?? b.publishedAt ?? b.NoticeDate ?? b.createdAt);
      return db - da;
    });
  });

  return groups;
}

export default function FacultyNoticeList({ onCreateNotice }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all | pinned | recent
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get current faculty user from localStorage
  const currentUser = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : {};
    } catch {
      return {};
    }
  }, []);

  const facultyId = currentUser?.id;
  const facultyName = currentUser?.name || "Faculty";

  // Use notices hook
  const { 
    notices, 
    loading, 
    error, 
    refresh: refreshNotices, 
    deleteNotice 
  } = useNotices({ limit: 50 });

  // Filter to show only this faculty's notices
  const myNotices = useMemo(() => {
    if (!Array.isArray(notices) || !facultyId) return [];
    
    return notices.filter(notice => {
      const authorId = notice.NoticeWrittenBy ?? notice.noticeWrittenBy ?? notice.authorId;
      return Number(authorId) === Number(facultyId);
    }).map(n => ({
      ...n,
      id: n.NoticeId ?? n.noticeId ?? n.id,
      title: n.NoticeTitle ?? n.noticeTitle,
      description: n.NoticeDescription ?? n.noticeDescription,
      publishedAt: n.PublishedAt ?? n.publishedAt ?? n.NoticeDate ?? n.createdAt,
      authorName: n.AuthorName || facultyName,
      isPinned: !!(n.IsPinned ?? n.isPinned),
      file: n.File ?? n.file,
      image: n.Image ?? n.image,
      authorType: n.AuthorType ?? n.authorType,
      priority: n.Priority ?? n.priority
    }));
  }, [notices, facultyId, facultyName]);

  // Apply search and filters
  const filteredNotices = useMemo(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    let s = myNotices;

    if (filter === "pinned") s = s.filter(x => x.isPinned);
    else if (filter === "recent") s = [...s].sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    if (!term) return s;
    return s.filter(x => 
      (x.title||"").toLowerCase().includes(term) || 
      (x.description||"").toLowerCase().includes(term)
    );
  }, [myNotices, searchTerm, filter]);

  // Group by date
  const groups = useMemo(() => groupByDate(filteredNotices), [filteredNotices]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshNotices();
    } catch (error) {
      console.error("Error refreshing notices:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshNotices]);

  // Delete handler
  const handleDelete = useCallback(async (noticeId) => {
    const notice = myNotices.find(n => n.id === noticeId);
    if (!notice) return;

    // Double check this is the faculty's own notice
    const authorId = notice.NoticeWrittenBy ?? notice.noticeWrittenBy ?? notice.authorId;
    if (Number(authorId) !== Number(facultyId)) {
      alert("You can only delete your own notices.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    const result = await deleteNotice(noticeId);
    if (result && !result.success) {
      alert("Failed to delete notice: " + (result.error || "Unknown error"));
    } else {
      // Refresh the list after deletion
      handleRefresh();
    }
  }, [myNotices, facultyId, deleteNotice, handleRefresh]);

  // Show error if not faculty
  if (currentUser?.role?.toLowerCase() !== 'faculty') {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
        <p className="text-red-700">This page is only accessible to faculty members.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">My Notices</h1>
          <p className="text-gray-600 mt-1">
            Logged in as: <span className="font-medium">{facultyName}</span> (Faculty)
          </p>
          <p className="text-sm text-gray-500">
            Total notices: {myNotices.length}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onCreateNotice && (
            <button 
              onClick={onCreateNotice}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Notice
            </button>
          )}
          
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg transition-colors ${
              isRefreshing 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-sm">
          <button 
            onClick={() => setFilter("all")} 
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === "all" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
          >
            All ({myNotices.length})
          </button>
          <button 
            onClick={() => setFilter("pinned")} 
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === "pinned" ? "bg-yellow-500 text-white" : "text-gray-700 hover:bg-gray-50"}`}
          >
            Pinned ({myNotices.filter(n => n.isPinned).length})
          </button>
          <button 
            onClick={() => setFilter("recent")} 
            className={`px-3 py-1 rounded-md text-sm font-medium ${filter === "recent" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
          >
            Recent
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your notices..."
            className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your notices...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && myNotices.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notices yet</h3>
          <p className="text-gray-600 mb-4">You haven't created any notices yet.</p>
          {onCreateNotice && (
            <button 
              onClick={onCreateNotice}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Notice
            </button>
          )}
        </div>
      )}

      {/* Notices List */}
      {!loading && !error && groups.length > 0 && (
        <div className="space-y-6">
          {groups.map(group => (
            <section key={group.key} className="space-y-4">
              <div className="text-sm text-gray-500 font-medium text-center py-2 bg-gray-50 rounded">
                {group.heading || group.key}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {group.items.map(notice => (
                  <div key={notice.id || Math.random()}>
                    <NoticeCard
                      notice={{
                        NoticeId: notice.id,
                        NoticeTitle: notice.title,
                        NoticeDescription: notice.description,
                        PublishedAt: notice.publishedAt,
                        AuthorName: notice.authorName,
                        Image: notice.image,
                        File: notice.file,
                        IsPinned: notice.isPinned,
                        Priority: notice.priority,
                        AuthorType: notice.authorType
                      }}
                      onDelete={handleDelete}
                      canDelete={true}
                      showDeleteButton={true}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Filtered Empty State */}
      {!loading && !error && filteredNotices.length === 0 && myNotices.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No notices match your search criteria
        </div>
      )}
    </div>
  );
}