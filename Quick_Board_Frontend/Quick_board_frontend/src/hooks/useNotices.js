// src/hooks/useNotices.js - Improved version
import { useState, useEffect, useCallback } from 'react';
import noticeApi from '../api/noticeApi';

const useNotices = (options = {}) => {
  const { limit = 20, before } = options;
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  // Function to fetch notices
  const fetchNotices = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      console.log('Fetching notices with options:', { limit, before });
      
      const response = await noticeApi.getAll({ limit, before });
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

      // Also fetch count if available
      try {
        const countResponse = await noticeApi.getCount();
        const totalCount = countResponse?.count ?? countResponse?.total ?? countResponse?.data?.count ?? noticesData.length;
        setCount(totalCount);
      } catch (countError) {
        console.warn('Could not fetch notice count:', countError);
        setCount(noticesData.length);
      }

    } catch (err) {
      console.error('Error fetching notices:', err);
      setError(err.message || 'Failed to fetch notices');
      setNotices([]); // Clear notices on error
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [limit, before]);

  // Function to refresh notices (force reload)
  const refresh = useCallback(async () => {
    console.log('Refreshing notices...');
    await fetchNotices(false); // Don't show loading indicator for refresh
  }, [fetchNotices]);

  // Function to delete a notice
  const deleteNotice = useCallback(async (noticeId) => {
    try {
      const response = await noticeApi.delete(noticeId);
      console.log('Delete notice response:', response);

      // Check if deletion was successful
      const isSuccess = response?.success === true || 
                       response?.Success === true || 
                       response?.deleted === true ||
                       (!response?.error && !response?.Error);

      if (isSuccess) {
        // Remove notice from local state immediately for better UX
        setNotices(prevNotices => 
          prevNotices.filter(notice => 
            (notice.NoticeId ?? notice.noticeId ?? notice.id) !== noticeId
          )
        );
        
        // Also refresh to ensure consistency with backend
        setTimeout(() => refresh(), 100);
        
        return { success: true };
      } else {
        const errorMsg = response?.message || response?.error || 'Failed to delete notice';
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      return { success: false, error: err.message || 'Failed to delete notice' };
    }
  }, [refresh]);

  // Function to add a new notice to the list (optimistic update)
  const addNotice = useCallback((newNotice) => {
    console.log('Adding new notice to list:', newNotice);
    setNotices(prevNotices => [newNotice, ...prevNotices]);
    setCount(prevCount => prevCount + 1);
  }, []);

  // Initial load
  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  return {
    notices,
    loading,
    error,
    count,
    refresh,
    deleteNotice,
    addNotice,
    refetch: fetchNotices, // Alias for fetchNotices
  };
};

export default useNotices;