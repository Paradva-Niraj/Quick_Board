// src/pages/admin/NoticeList.jsx - Role-based access control + improved grouping/sorting
import React, { useState, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import NoticeCard from "./NoticeCard";

/* Helpers */
function friendlyDateHeading(date) {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  // diffDays = d_date - today_date in days
  const diffDays = Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

/**
 * Group notices by date (YYYY-MM-DD). Return array of groups sorted by date
 * descending (today first). Unknown dates go last. Within each group:
 * - pinned items first (sorted newest -> oldest)
 * - then non-pinned items (sorted newest -> oldest)
 */
function groupByDate(notices) {
  const map = new Map();

  for (const n of notices) {
    const published =
      n.PublishedAt ?? n.publishedAt ?? n.NoticeDate ?? n.createdAt ?? null;
    const d = published ? new Date(published) : null;
    const key = d ? d.toISOString().slice(0, 10) : "unknown";

    if (!map.has(key)) {
      const heading = friendlyDateHeading(d);
      map.set(key, { key, heading, dateObj: d, items: [] });
    }
    map.get(key).items.push(n);
  }

  // Convert to array and sort groups by date descending (today, yesterday, older).
  const groups = Array.from(map.values()).sort((a, b) => {
    if (a.key === "unknown" && b.key === "unknown") return 0;
    if (a.key === "unknown") return 1; // unknown go last
    if (b.key === "unknown") return -1;
    // Both have date keys (YYYY-MM-DD) — compare strings descending
    if (a.key > b.key) return -1;
    if (a.key < b.key) return 1;
    return 0;
  });

  // For each group, sort items: pinned first, then by publishedAt desc
  groups.forEach((g) => {
    g.items.sort((a, b) => {
      const pa = !!(a.IsPinned ?? a.isPinned);
      const pb = !!(b.IsPinned ?? b.isPinned);
      if (pa && !pb) return -1;
      if (!pa && pb) return 1;
      const da = new Date(
        a.PublishedAt ?? a.publishedAt ?? a.NoticeDate ?? a.createdAt ?? 0
      ).getTime();
      const db = new Date(
        b.PublishedAt ?? b.publishedAt ?? b.NoticeDate ?? b.createdAt ?? 0
      ).getTime();
      return db - da;
    });
  });

  return groups;
}

/* Component */
export default function NoticeList({
  notices = [],
  loading = false,
  error = null,
  onDelete = null,
  showSearch = true,
  showFilters = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filter, setFilter] = useState("all");

  // Get current user from localStorage
  const currentUser = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : {};
    } catch {
      return {};
    }
  }, []);

  const userRole = (currentUser?.role || "").toString().toLowerCase();
  const userId = currentUser?.id;

  // Determine delete permission per notice
  const canDeleteNotice = useCallback(
    (notice) => {
      if (userRole === "student") return false;
      if (userRole === "admin") return true;

      if (userRole === "faculty") {
        const noticeAuthorId =
          notice.NoticeWrittenBy ?? notice.noticeWrittenBy ?? notice.authorId;
        return Number(noticeAuthorId) === Number(userId);
      }
      return false;
    },
    [userRole, userId]
  );

  // Normalize notices into a stable shape
  const normalized = useMemo(() => {
    return (notices || []).map((n) => ({
      ...n,
      id: n.NoticeId ?? n.noticeId ?? n.id,
      title: n.NoticeTitle ?? n.noticeTitle ?? "",
      description: n.NoticeDescription ?? n.noticeDescription ?? "",
      publishedAt:
        n.PublishedAt ?? n.publishedAt ?? n.NoticeDate ?? n.createdAt ?? null,
      authorName: n.AuthorName ?? n.authorName ?? "",
      isPinned: !!(n.IsPinned ?? n.isPinned),
      file: n.File ?? n.file ?? null,
      image: n.Image ?? n.image ?? null,
      authorType: n.AuthorType ?? n.authorType ?? null,
      priority: n.Priority ?? n.priority ?? null,
      canDelete: canDeleteNotice(n),
    }));
  }, [notices, canDeleteNotice]);

  // Apply filter & search
  const filtered = useMemo(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    let s = normalized;

    if (filter === "pinned") {
      s = s.filter((x) => x.isPinned);
    } else if (filter === "recent") {
      const now = Date.now();
      s = s.filter((x) => {
        const d = new Date(x.publishedAt);
        const diffHours = (now - d.getTime()) / (1000 * 60 * 60);
        return diffHours <= 2;
      });
      s = [...s].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }

    if (!term) return s;

    return s.filter((x) => {
      switch (searchField) {
        case "id":
          return String(x.id || "").includes(term);
        case "title":
          return (x.title || "").toLowerCase().includes(term);
        case "description":
          return (x.description || "").toLowerCase().includes(term);
        case "author":
          return (x.authorName || "").toLowerCase().includes(term);
        default:
          return (
            String(x.id || "").includes(term) ||
            (x.title || "").toLowerCase().includes(term) ||
            (x.description || "").toLowerCase().includes(term) ||
            (x.authorName || "").toLowerCase().includes(term)
          );
      }
    });
  }, [normalized, searchTerm, filter, searchField]);

  // Group by date and sort groups (today first) and items inside groups
  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const handleDelete = async (id) => {
    if (!onDelete) return;

    const notice = normalized.find((n) => n.id === id);
    if (!notice?.canDelete) {
      alert("You don't have permission to delete this notice.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    const res = await onDelete(id);
    if (res && !res.success) {
      alert("Failed to delete notice: " + (res.error || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading notices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {showFilters && (
            <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-sm">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === "all" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilter("pinned")}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === "pinned" ? "bg-yellow-500 text-white" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Pinned
              </button>

              {/* <button
                onClick={() => setFilter("recent")}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === "recent" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Recent
              </button> */}
            </div>
          )}

          {showSearch && (
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="border border-gray-200 rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="id">ID</option>
                <option value="title">Title</option>
                <option value="description">Description</option>
                <option value="author">Author</option>
              </select>

              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search notices..."
                  className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notice Groups */}
      <div className="space-y-6">
        {groups.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No notices found</div>
        ) : (
          groups.map((group) => (
            <section key={group.key} className="space-y-4">
              <div className="text-sm text-gray-500 font-medium text-center py-2 bg-gray-50 rounded">
                {group.heading || group.key}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {group.items.map((notice) => (
                  <div key={notice.id ?? JSON.stringify(notice)}>
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
                        AuthorType: notice.authorType,
                      }}
                      onDelete={notice.canDelete ? handleDelete : null}
                      canDelete={notice.canDelete}
                      showDeleteButton={notice.canDelete}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {filtered.length === 0 && groups.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No notices match your search criteria
        </div>
      )}
    </div>
  );
}