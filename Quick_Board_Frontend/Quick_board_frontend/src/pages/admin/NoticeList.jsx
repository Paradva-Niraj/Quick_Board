// src/pages/admin/NoticeList.jsx
import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Search } from "lucide-react";
import NoticeCard from "./NoticeCard";
import useNotices from "../../hooks/useNotices";

/* Helpers */
function friendlyDateHeading(date) {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  const diffDays = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))/ (1000*60*60*24));
  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  // otherwise show human friendly: 25 Jan 2025 or "Jan 25, 2025" based on locale
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

function groupByDate(notices) {
  // notices expected to be ordered by pinned desc, publishedAt desc for each page
  // We'll produce groups keyed by date string (UTC date)
  const groups = [];
  const map = new Map();
  for (const n of notices) {
    const published = n.PublishedAt ?? n.publishedAt ?? n.publishedAt;
    const d = published ? new Date(published) : null;
    const key = d ? d.toISOString().slice(0,10) : "unknown"; // YYYY-MM-DD
    if (!map.has(key)) {
      const heading = friendlyDateHeading(d);
      map.set(key, { key, heading, items: [] });
      groups.push(map.get(key));
    }
    map.get(key).items.push(n);
  }

  // Within each group, ensure pinned come first (pinned bool may be in Pascal or camel)
  groups.forEach(g => {
    g.items.sort((a, b) => {
      const pa = !!(a.IsPinned ?? a.isPinned);
      const pb = !!(b.IsPinned ?? b.isPinned);
      if (pa && !pb) return -1;
      if (!pa && pb) return 1;
      // fallback: newest first
      const da = new Date(a.PublishedAt ?? a.publishedAt);
      const db = new Date(b.PublishedAt ?? b.publishedAt);
      return db - da;
    });
  });

  return groups;
}

/* Component */
export default function NoticeListPage() {
  const {
    notices,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    deleteNotice,
  } = useNotices({ limit: 20 });

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all | pinned | recent
  const sentinelRef = useRef(null);

  // derived filtered list by search & filter
  const normalized = useMemo(() => {
    return (notices || []).map(n => ({
      ...n,
      id: n.NoticeId ?? n.noticeId ?? n.id,
      title: n.NoticeTitle ?? n.noticeTitle,
      description: n.NoticeDescription ?? n.noticeDescription,
      publishedAt: n.PublishedAt ?? n.publishedAt,
      authorName: n.AuthorName ?? n.authorName,
      isPinned: !!(n.IsPinned ?? n.isPinned),
      file: n.File ?? n.file,
      image: n.Image ?? n.image,
      authorType: n.AuthorType ?? n.authorType,
      priority: n.Priority ?? n.priority
    }));
  }, [notices]);

  const filtered = useMemo(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    let s = normalized;
    if (filter === "pinned") s = s.filter(x => x.isPinned);
    else if (filter === "recent") s = [...s].sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    if (!term) return s;
    return s.filter(x => (x.title||"").toLowerCase().includes(term) || (x.description||"").toLowerCase().includes(term) || (x.authorName||"").toLowerCase().includes(term));
  }, [normalized, searchTerm, filter]);

  // grouping
  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  // infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      });
    }, { root: null, rootMargin: "300px", threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, hasMore, loadingMore]);

  const handleDelete = async (id) => {
    const res = await deleteNotice(id);
    if (!res.success) {
      alert("Failed to delete notice: " + (res.error || "Unknown"));
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notice Feed</h1>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 bg-white p-1 rounded-lg shadow-sm">
            <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded-md text-sm ${filter === "all" ? "bg-blue-600 text-white" : "text-gray-700"}`}>All</button>
            <button onClick={() => setFilter("pinned")} className={`px-3 py-1 rounded-md text-sm ${filter === "pinned" ? "bg-yellow-500 text-white" : "text-gray-700"}`}>Pinned</button>
            <button onClick={() => setFilter("recent")} className={`px-3 py-1 rounded-md text-sm ${filter === "recent" ? "bg-green-600 text-white" : "text-gray-700"}`}>Recent</button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, description or author..."
              className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full"
            />
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>}

      <div className="flex flex-col gap-4">
        {groups.length === 0 && !loading && <div className="text-gray-600">No notices found</div>}

        {groups.map(group => (
          <section key={group.key}>
            <div className="py-1 text-sm text-gray-500 font-medium text-center mb-3">{group.heading || group.key}</div>
            <div className="grid grid-cols-1 gap-4">
              {group.items.map(n => (
                <div key={(n.id ?? n.title ?? Math.random()).toString()}>
                  <NoticeCard
                    notice={{
                      NoticeId: n.id,
                      NoticeTitle: n.title,
                      NoticeDescription: n.description,
                      PublishedAt: n.publishedAt,
                      AuthorName: n.authorName,
                      Image: n.image,
                      File: n.file,
                      IsPinned: n.isPinned,
                      Priority: n.priority,
                      AuthorType: n.authorType
                    }}
                    onDelete={handleDelete}
                    canDelete={true}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {loading && <div className="text-center py-6"><div className="animate-spin h-8 w-8 border-b-2 border-gray-500 mx-auto"></div></div>}

        <div ref={sentinelRef} />

        {loadingMore && <div className="text-center py-4"><div className="animate-spin h-6 w-6 border-b-2 border-gray-500 mx-auto"></div></div>}
        {!hasMore && !loading && <div className="text-center py-4 text-gray-500">You've reached the end.</div>}
      </div>
    </div>
  );
}