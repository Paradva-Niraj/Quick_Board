// src/hooks/useNotices.js
import { useState, useCallback, useEffect, useRef } from "react";
import noticeApi from "../api/noticeApi";

/*
  useNotices:
    - fetch initial page (default limit 20)
    - loadMore() to get older notices using before = last item's PublishedAt
    - refresh() to refetch from newest
*/
export default function useNotices({ limit = 20 } = {}) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const lastFetchedBeforeRef = useRef(null);

  const fetchPage = useCallback(
    async ({ before = null, append = false } = {}) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError("");

        const data = await noticeApi.getAll({ before, limit });
        // data may be null/NoContent -> our authAPI returns null; normalize to []
        const items = Array.isArray(data) ? data : [];

        // update hasMore: if returned less than limit, no more
        setHasMore(items.length === limit);

        if (append) {
          setNotices((prev) => [...prev, ...items]);
        } else {
          setNotices(items);
        }

        // update lastFetchedBeforeRef to the PublishedAt of the last item (oldest)
        if (items.length > 0) {
          const last = items[items.length - 1];
          lastFetchedBeforeRef.current = last.PublishedAt ?? last.publishedAt ?? null;
        }
        return items;
      } catch (err) {
        console.error("fetchPage error:", err);
        const msg = err?.message || err?.data?.message || "Failed to load notices";
        setError(msg);
        return [];
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [limit]
  );

  // initial load
  useEffect(() => {
    fetchPage({ before: null, append: false });
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return [];
    const before = lastFetchedBeforeRef.current;
    // if no before (no items), do not load more
    if (!before) return [];
    return await fetchPage({ before, append: true });
  }, [fetchPage, hasMore]);

  const refresh = useCallback(async () => {
    lastFetchedBeforeRef.current = null;
    setHasMore(true);
    return await fetchPage({ before: null, append: false });
  }, [fetchPage]);

  const deleteNotice = useCallback(
    async (id) => {
      try {
        await noticeApi.delete(id);
        // remove locally for faster UX
        setNotices((prev) => prev.filter((n) => (n.NoticeId ?? n.noticeId ?? n.id) !== id));
        return { success: true };
      } catch (err) {
        console.error("deleteNotice error:", err);
        const msg = err?.message || err?.data?.message || "Failed to delete notice";
        return { success: false, error: msg };
      }
    },
    []
  );

  const getCount = useCallback(async () => {
    try {
      const res = await noticeApi.getCount();
      return res?.total ?? null;
    } catch (err) {
      console.error("getCount error:", err);
      return null;
    }
  }, []);

  return {
    notices,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchPage,
    loadMore,
    refresh,
    deleteNotice,
    getCount,
  };
}