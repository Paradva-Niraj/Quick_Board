// src/hooks/useNotices.js - With Infinite Scroll Support
import { useState, useEffect, useCallback } from 'react';
import noticeApi from '../api/noticeApi';

const useNotices = (options = {}) => {
  const { initialLimit = 20 } = options;
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Fetch total count
  const fetchCount = useCallback(async () => {
    try {
      const countResponse = await noticeApi.getCount();
      console.log('Raw count response:', countResponse);
      
      // Try multiple possible response structures
      const totalCount = 
        countResponse?.total ?? 
        countResponse?.count ?? 
        countResponse?.data?.total ?? 
        countResponse?.data?.count ?? 
        0;
      
      console.log('Parsed total notice count:', totalCount);
      setCount(totalCount);
      return totalCount;
    } catch (countError) {
      console.error('Error fetching notice count:', countError);
      return 0;
    }
  }, []);

  // Initial fetch - load first batch
  const fetchNotices = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      console.log('Fetching initial notices with limit:', initialLimit);
      
      const response = await noticeApi.getAll({ limit: initialLimit });
      console.log('Notices API response:', response);

      // Handle different response structures
      let noticesData = [];
      if (response?.data) {
        noticesData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        noticesData = response;
      } else if (response?.notices) {
        noticesData = Array.isArray(response.notices) ? response.notices : [];
      }

      console.log('Parsed notices data:', noticesData);
      setNotices(noticesData);
      setHasMore(noticesData.length >= initialLimit);

    } catch (err) {
      console.error('Error fetching notices:', err);
      setError(err.message || 'Failed to fetch notices');
      setNotices([]);
      setHasMore(false);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [initialLimit]);

  // Load more notices (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) {
      console.log('Skipping loadMore:', { hasMore, loadingMore, loading });
      return;
    }

    setLoadingMore(true);
    console.log('Loading more notices...');

    try {
      // Get the oldest notice's publishedAt as "before" parameter
      const oldestNotice = notices[notices.length - 1];
      const before = oldestNotice?.PublishedAt || oldestNotice?.publishedAt;

      if (!before) {
        console.log('No before timestamp available, stopping pagination');
        setHasMore(false);
        return;
      }

      console.log('Fetching notices before:', before);
      const response = await noticeApi.getAll({ before, limit: initialLimit });

      // Handle different response structures
      let noticesData = [];
      if (response?.data) {
        noticesData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        noticesData = response;
      } else if (response?.notices) {
        noticesData = Array.isArray(response.notices) ? response.notices : [];
      }

      console.log('Loaded more notices:', noticesData.length);

      if (noticesData.length > 0) {
        setNotices(prev => [...prev, ...noticesData]);
        setHasMore(noticesData.length >= initialLimit);
      } else {
        setHasMore(false);
      }

    } catch (err) {
      console.error('Error loading more notices:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [notices, hasMore, loadingMore, loading, initialLimit]);

  // Refresh notices (force reload from beginning)
  const refresh = useCallback(async () => {
    console.log('Refreshing notices...');
    setHasMore(true); // Reset hasMore flag
    await fetchNotices(false);
    // Fetch count after refresh to ensure it's up to date
    await fetchCount();
  }, [fetchNotices, fetchCount]);

  // Delete a notice
  const deleteNotice = useCallback(async (noticeId) => {
    try {
      const response = await noticeApi.delete(noticeId);
      console.log('Delete notice response:', response);

      const isSuccess = response?.success === true || 
                       response?.Success === true || 
                       response?.deleted === true ||
                       (!response?.error && !response?.Error);

      if (isSuccess) {
        // Remove notice from local state
        setNotices(prevNotices => 
          prevNotices.filter(notice => 
            (notice.NoticeId ?? notice.noticeId ?? notice.id) !== noticeId
          )
        );
        
        // Update count
        setCount(prevCount => Math.max(0, prevCount - 1));
        
        return { success: true };
      } else {
        const errorMsg = response?.message || response?.error || 'Failed to delete notice';
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      return { success: false, error: err.message || 'Failed to delete notice' };
    }
  }, []);

  // Add a new notice (optimistic update)
  const addNotice = useCallback((newNotice) => {
    console.log('Adding new notice to list:', newNotice);
    setNotices(prevNotices => [newNotice, ...prevNotices]);
    setCount(prevCount => prevCount + 1);
  }, []);

  // Initial load - fetch both notices and count
  useEffect(() => {
    const init = async () => {
      console.log('=== INITIALIZING NOTICES ===');
      await fetchNotices();
      console.log('=== FETCHING COUNT SEPARATELY ===');
      const totalCount = await fetchCount();
      console.log('=== INITIALIZATION COMPLETE - Total Count:', totalCount, '===');
    };
    init();
  }, [fetchNotices, fetchCount]);

  return {
    notices,
    loading,
    loadingMore,
    error,
    count,
    hasMore,
    loadMore,
    refresh,
    deleteNotice,
    addNotice,
    refetch: fetchNotices,
  };
};

export default useNotices;