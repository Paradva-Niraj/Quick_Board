// src/components/admin/FacultyManagement.jsx
import React, { useState, useEffect } from 'react';
import { facultyApi } from '../../api/adminApi';
import DataTable from '../ui/DataTable';
import SearchBar from '../ui/SearchBar';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    const filtered = faculty.filter(f =>
      f.FacultyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.FacultyMail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFaculty(filtered);
  }, [faculty, searchTerm]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const data = await facultyApi.getAllFaculty();
      setFaculty(data);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setError('Failed to fetch faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (facultyMember) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      await facultyApi.approveFaculty(facultyMember.FacultyId, currentUser.id);
      
      setFaculty(faculty.map(f => 
        f.FacultyId === facultyMember.FacultyId 
          ? { ...f, RequestStatus: true, AddedBy: currentUser.id }
          : f
      ));
    } catch (error) {
      console.error('Error approving faculty:', error);
      setError('Failed to approve faculty');
    }
  };

  const handleDelete = async (facultyMember) => {
    if (!window.confirm(`Are you sure you want to delete "${facultyMember.FacultyName}"?`)) {
      return;
    }

    try {
      await facultyApi.deleteFaculty(facultyMember.FacultyId);
      setFaculty(faculty.filter(f => f.FacultyId !== facultyMember.FacultyId));
    } catch (error) {
      console.error('Error deleting faculty:', error);
      setError('Failed to delete faculty');
    }
  };

  const getStatusBadge = (status) => {
    if (status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
  };

  const columns = [
    {
      header: 'Faculty ID',
      key: 'FacultyId',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900">
          #{row.FacultyId}
        </span>
      )
    },
    {
      header: 'Name',
      key: 'FacultyName',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900">
          {row.FacultyName}
        </span>
      )
    },
    {
      header: 'Email',
      key: 'FacultyMail',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.FacultyMail}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'RequestStatus',
      render: (row) => getStatusBadge(row.RequestStatus)
    },
    {
      header: 'Added By',
      key: 'AddedBy',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.AddedBy ? `Admin #${row.AddedBy}` : '-'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'Approve',
      onClick: handleApprove,
      className: 'bg-green-100 text-green-800 hover:bg-green-200',
      condition: (row) => !row.RequestStatus
    },
    {
      label: 'Delete',
      onClick: handleDelete,
      className: 'bg-red-100 text-red-800 hover:bg-red-200'
    }
  ];

  // Get statistics
  const pendingCount = faculty.filter(f => !f.RequestStatus).length;
  const approvedCount = faculty.filter(f => f.RequestStatus).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Faculty Management</h2>
        <div className="flex gap-4 text-sm">
          <span className="text-yellow-600 font-medium">
            Pending: {pendingCount}
          </span>
          <span className="text-green-600 font-medium">
            Approved: {approvedCount}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search faculty by name or email..."
          className="w-full sm:w-96"
        />
        <span className="text-sm text-gray-500">
          {filteredFaculty.length} of {faculty.length} faculty members
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={filteredFaculty}
          loading={loading}
          actions={actions}
        />
      </div>
    </div>
  );
};

export default FacultyManagement;