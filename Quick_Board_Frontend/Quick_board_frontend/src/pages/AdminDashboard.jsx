// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { adminApi, courseApi, facultyApi, studentApi, noticeApi } from '../api/adminApi';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Lazy loaded components
const CourseManagement = lazy(() => import('../components/admin/CourseManagement'));
const FacultyManagement = lazy(() => import('../components/admin/FacultyManagement'));
const StudentManagement = lazy(() => import('../components/admin/StudentManagement'));
const NoticeManagement = lazy(() => import('../components/admin/NoticeManagement'));

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalFaculty: 0,
    pendingFaculty: 0,
    totalStudents: 0,
    pendingStudents: 0,
    totalNotices: 0,
    pinnedNotices: 0,
    totalAdmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const [courses, faculty, students, notices, admins] = await Promise.allSettled([
        courseApi.getAllCourses(),
        facultyApi.getAllFaculty(),
        studentApi.getAllStudents(),
        noticeApi.getAllNotices(),
        adminApi.getAllAdmins()
      ]);

      const coursesData = courses.status === 'fulfilled' ? courses.value : [];
      const facultyData = faculty.status === 'fulfilled' ? faculty.value : [];
      const studentsData = students.status === 'fulfilled' ? students.value : [];
      const noticesData = notices.status === 'fulfilled' ? notices.value : [];
      const adminsData = admins.status === 'fulfilled' ? admins.value : [];

      setStats({
        totalCourses: coursesData.length,
        totalFaculty: facultyData.length,
        pendingFaculty: facultyData.filter(f => !f.RequestStatus).length,
        totalStudents: studentsData.length,
        pendingStudents: studentsData.filter(s => !s.RequestStatus).length,
        totalNotices: noticesData.length,
        pinnedNotices: noticesData.filter(n => n.IsPinned).length,
        totalAdmins: adminsData.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'courses', name: 'Courses', icon: '📚' },
    { id: 'faculty', name: 'Faculty', icon: '👨‍🏫' },
    { id: 'students', name: 'Students', icon: '👨‍🎓' },
    { id: 'notices', name: 'Notices', icon: '📢' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Courses"
                value={stats.totalCourses}
                icon="📚"
                color="blue"
              />
              <StatCard
                title="Total Faculty"
                value={stats.totalFaculty}
                icon="👨‍🏫"
                color="green"
              />
              <StatCard
                title="Pending Faculty"
                value={stats.pendingFaculty}
                icon="⏳"
                color="yellow"
              />
              <StatCard
                title="Total Admins"
                value={stats.totalAdmins}
                icon="👨‍💼"
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon="👨‍🎓"
                color="indigo"
              />
              <StatCard
                title="Pending Students"
                value={stats.pendingStudents}
                icon="⏳"
                color="yellow"
              />
              <StatCard
                title="Total Notices"
                value={stats.totalNotices}
                icon="📢"
                color="red"
              />
              <StatCard
                title="Pinned Notices"
                value={stats.pinnedNotices}
                icon="📌"
                color="yellow"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('courses')}
                  className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-2xl mr-2">📚</span>
                  <span className="text-blue-700 font-medium">Manage Courses</span>
                </button>
                <button
                  onClick={() => setActiveTab('faculty')}
                  className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-2xl mr-2">👨‍🏫</span>
                  <span className="text-green-700 font-medium">Approve Faculty</span>
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className="flex items-center justify-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <span className="text-2xl mr-2">👨‍🎓</span>
                  <span className="text-indigo-700 font-medium">View Students</span>
                </button>
                <button
                  onClick={() => setActiveTab('notices')}
                  className="flex items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <span className="text-2xl mr-2">📢</span>
                  <span className="text-red-700 font-medium">Manage Notices</span>
                </button>
              </div>
            </div>

            {(stats.pendingFaculty > 0 || stats.pendingStudents > 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Pending Approvals</h3>
                <div className="space-y-2">
                  {stats.pendingFaculty > 0 && (
                    <p className="text-yellow-700">
                      <span className="font-medium">{stats.pendingFaculty}</span> faculty member(s) waiting for approval
                    </p>
                  )}
                  {stats.pendingStudents > 0 && (
                    <p className="text-yellow-700">
                      <span className="font-medium">{stats.pendingStudents}</span> student(s) waiting for approval
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      case 'courses':
        return <CourseManagement />;
      case 'faculty':
        return <FacultyManagement />;
      case 'students':
        return <StudentManagement />;
      case 'notices':
        return <NoticeManagement />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Quick Board - Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {/* Show pending count badges */}
                {tab.id === 'faculty' && stats.pendingFaculty > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {stats.pendingFaculty}
                  </span>
                )}
                {tab.id === 'students' && stats.pendingStudents > 0 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {stats.pendingStudents}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <Suspense fallback={
          <div className="flex justify-center items-center p-8">
            <LoadingSpinner />
          </div>
        }>
          {renderTabContent()}
        </Suspense>
      </div>
    </div>
  );
};

export default AdminDashboard;