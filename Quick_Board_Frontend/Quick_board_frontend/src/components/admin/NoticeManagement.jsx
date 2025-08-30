// src/components/admin/NoticeManagement.jsx
import React, { useState, useEffect } from 'react';
import { noticeApi } from '../../api/adminApi';
import DataTable from '../ui/DataTable';
import SearchBar from '../ui/SearchBar';

const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    const filtered = notices.filter(notice =>
      notice.NoticeTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.NoticeDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.AuthorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.AuthorType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotices(filtered);
  }, [notices, searchTerm]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeApi.getAllNotices();
      setNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error);
      setError('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notice) => {
    if (!window.confirm(`Are you sure you want to delete "${notice.NoticeTitle}"?`)) {
      return;
    }

    try {
      await noticeApi.deleteNotice(notice.NoticeId);
      setNotices(notices.filter(n => n.NoticeId !== notice.NoticeId));
    } catch (error) {
      console.error('Error deleting notice:', error);
      setError('Failed to delete notice');
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    );
  };

  const getAuthorBadge = (authorType) => {
    const colors = {
      'Admin': 'bg-purple-100 text-purple-800',
      'Faculty': 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[authorType] || 'bg-gray-100 text-gray-800'}`}>
        {authorType}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      header: 'Title',
      key: 'NoticeTitle',
      render: (row) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">
            {row.IsPinned && <span className="text-yellow-500 mr-1">📌</span>}
            {row.NoticeTitle}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {row.NoticeDescription}
          </div>
        </div>
      )
    },
    {
      header: 'Author',
      key: 'AuthorName',
      render: (row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.AuthorName}
          </div>
          <div className="mt-1">
            {getAuthorBadge(row.AuthorType)}
          </div>
        </div>
      )
    },
    {
      header: 'Priority',
      key: 'Priority',
      render: (row) => getPriorityBadge(row.Priority)
    },
    {
      header: 'Published',
      key: 'PublishedAt',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {formatDate(row.PublishedAt)}
        </span>
      )
    },
    {
      header: 'Attachments',
      key: 'attachments',
      render: (row) => (
        <div className="flex gap-1">
          {row.Image && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
              📷 Image
            </span>
          )}
          {row.File && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
              📎 File
            </span>
          )}
          {!row.Image && !row.File && (
            <span className="text-xs text-gray-400">None</span>
          )}
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Delete',
      onClick: handleDelete,
      className: 'bg-red-100 text-red-800 hover:bg-red-200'
    }
  ];

  // Get statistics
  const pinnedCount = notices.filter(n => n.IsPinned).length;
  const authorStats = notices.reduce((acc, notice) => {
    acc[notice.AuthorType] = (acc[notice.AuthorType] || 0) + 1;
    return acc;
  }, {});
  const priorityStats = notices.reduce((acc, notice) => {
    acc[notice.Priority] = (acc[notice.Priority] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Notice Management</h2>
        <div className="flex gap-4 text-sm">
          <span className="text-yellow-600 font-medium">
            📌 Pinned: {pinnedCount}
          </span>
          <span className="text-gray-600 font-medium">
            Total: {notices.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search notices by title, description, or author..."
          className="w-full sm:w-96"
        />
        <span className="text-sm text-gray-500">
          {filteredNotices.length} of {notices.length} notices
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Author Statistics */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Notices by Author Type</h3>
          <div className="space-y-2">
            {Object.entries(authorStats).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{type}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Statistics */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Notices by Priority</h3>
          <div className="space-y-2">
            {Object.entries(priorityStats).map(([priority, count]) => (
              <div key={priority} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{priority}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={filteredNotices}
          loading={loading}
          actions={actions}
        />
      </div>
    </div>
  );
};

export default NoticeManagement;