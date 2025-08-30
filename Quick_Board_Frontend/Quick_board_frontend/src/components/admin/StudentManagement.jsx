// src/components/admin/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import { studentApi } from '../../api/adminApi';
import DataTable from '../ui/DataTable';
import SearchBar from '../ui/SearchBar';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(s =>
      s.StudentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.StudentMail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.CourseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ApprovedByFaculty?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Are you sure you want to delete "${student.StudentName}"?`)) {
      return;
    }

    try {
      await studentApi.deleteStudent(student.StudentId);
      setStudents(students.filter(s => s.StudentId !== student.StudentId));
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('Failed to delete student');
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
      header: 'Student ID',
      key: 'StudentId',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900">
          #{row.StudentId}
        </span>
      )
    },
    {
      header: 'Name',
      key: 'StudentName',
      render: (row) => (
        <span className="text-sm font-medium text-gray-900">
          {row.StudentName}
        </span>
      )
    },
    {
      header: 'Email',
      key: 'StudentMail',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.StudentMail}
        </span>
      )
    },
    {
      header: 'Course',
      key: 'CourseName',
      render: (row) => (
        <span className="text-sm text-gray-900 font-medium">
          {row.CourseName}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'RequestStatus',
      render: (row) => getStatusBadge(row.RequestStatus)
    },
    {
      header: 'Approved By',
      key: 'ApprovedByFaculty',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.ApprovedByFaculty || '-'}
        </span>
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
  const pendingCount = students.filter(s => !s.RequestStatus).length;
  const approvedCount = students.filter(s => s.RequestStatus).length;
  const courseStats = students.reduce((acc, student) => {
    acc[student.CourseName] = (acc[student.CourseName] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
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
          placeholder="Search students by name, email, course, or faculty..."
          className="w-full sm:w-96"
        />
        <span className="text-sm text-gray-500">
          {filteredStudents.length} of {students.length} students
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Course Statistics */}
      {Object.keys(courseStats).length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Students by Course</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(courseStats).map(([course, count]) => (
              <div key={course} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-900">{course}</div>
                <div className="text-lg font-bold text-blue-600">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={filteredStudents}
          loading={loading}
          actions={actions}
        />
      </div>
    </div>
  );
};

export default StudentManagement;