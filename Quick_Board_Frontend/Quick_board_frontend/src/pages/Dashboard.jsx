import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Check, X, Users, GraduationCap, FileText, BookOpen, Filter, Eye } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [courseForm, setCourseForm] = useState({ CourseName: '' });

  const token = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`/api${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!response.ok) throw new Error(await response.text());
    return response.status === 204 ? null : response.json();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facultyData, studentData, noticeData, courseData] = await Promise.all([
        apiCall('/Faculty').catch(() => []),
        apiCall('/Student').catch(() => []),
        apiCall('/Notice').catch(() => []),
        apiCall('/Course').catch(() => [])
      ]);
      setFaculties(facultyData || []);
      setStudents(studentData || []);
      setNotices(noticeData || []);
      setCourses(courseData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (action, type, id, data = null) => {
    try {
      if (action === 'approve' && type === 'faculty') {
        await apiCall(`/Faculty/approve/${id}`, { method: 'PUT', body: JSON.stringify({ AdminId: user.id }) });
      } else if (action === 'delete') {
        await apiCall(`/${type}/${id}`, { method: 'DELETE' });
      } else if (action === 'add' && type === 'Course') {
        await apiCall('/Course', { method: 'POST', body: JSON.stringify(data) });
      } else if (action === 'edit' && type === 'Course') {
        await apiCall(`/Course/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      }
      fetchData();
      setShowModal(false);
      setCourseForm({ CourseName: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (type === 'editCourse' && item) setCourseForm({ CourseName: item.CourseName });
    setShowModal(true);
  };

  const filterData = (data, fields) => data.filter(item => 
    fields.some(field => item[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const StatCard = ({ title, count, icon: Icon, color }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
        <Icon className={`h-12 w-12 ${color.includes('blue') ? 'text-blue-500' : color.includes('green') ? 'text-green-500' : color.includes('purple') ? 'text-purple-500' : 'text-orange-500'}`} />
      </div>
    </div>
  );

  const DataTable = ({ data, columns, actions }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {actions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => action.onClick(item)}
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors ${action.className}`}
                    >
                      <action.icon className="h-4 w-4 mr-1" />
                      {action.label}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-end mb-4">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  const renderTabContent = () => {
    const filteredFaculties = filterData(faculties, ['FacultyName', 'FacultyMail']);
    const filteredStudents = filterData(students, ['StudentName', 'StudentMail', 'CourseName']);
    const filteredNotices = filterData(notices, ['NoticeTitle', 'NoticeDescription', 'AuthorName']);
    const filteredCourses = filterData(courses, ['CourseName']);

    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Faculty" count={faculties.length} icon={GraduationCap} color="border-blue-500" />
            <StatCard title="Total Students" count={students.length} icon={Users} color="border-green-500" />
            <StatCard title="Total Notices" count={notices.length} icon={FileText} color="border-purple-500" />
            <StatCard title="Total Courses" count={courses.length} icon={BookOpen} color="border-orange-500" />
          </div>
        );

      case 'faculty':
        return (
          <DataTable
            data={filteredFaculties}
            columns={[
              { key: 'FacultyId', label: 'ID' },
              { key: 'FacultyName', label: 'Name' },
              { key: 'FacultyMail', label: 'Email' },
              { key: 'RequestStatus', label: 'Status', render: (status) => (
                <span className={`px-2 py-1 rounded-full text-xs ${status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {status ? 'Approved' : 'Pending'}
                </span>
              )},
              { key: 'AddedBy', label: 'Added By' }
            ]}
            actions={[
              ...(filteredFaculties.some(f => !f.RequestStatus) ? [{
                label: 'Approve', icon: Check, className: 'bg-green-100 text-green-800 hover:bg-green-200',
                onClick: (item) => !item.RequestStatus && handleAction('approve', 'faculty', item.FacultyId)
              }] : []),
              { label: 'Delete', icon: Trash2, className: 'bg-red-100 text-red-800 hover:bg-red-200',
                onClick: (item) => handleAction('delete', 'Faculty', item.FacultyId) }
            ]}
          />
        );

      case 'students':
        return (
          <DataTable
            data={filteredStudents}
            columns={[
              { key: 'StudentId', label: 'ID' },
              { key: 'StudentName', label: 'Name' },
              { key: 'StudentMail', label: 'Email' },
              { key: 'CourseName', label: 'Course' },
              { key: 'RequestStatus', label: 'Status', render: (status) => (
                <span className={`px-2 py-1 rounded-full text-xs ${status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {status ? 'Approved' : 'Pending'}
                </span>
              )},
              { key: 'ApprovedByFaculty', label: 'Approved By' }
            ]}
            actions={[
              { label: 'Delete', icon: Trash2, className: 'bg-red-100 text-red-800 hover:bg-red-200',
                onClick: (item) => handleAction('delete', 'Student', item.StudentId) }
            ]}
          />
        );

      case 'notices':
        return (
          <DataTable
            data={filteredNotices}
            columns={[
              { key: 'NoticeId', label: 'ID' },
              { key: 'NoticeTitle', label: 'Title' },
              { key: 'AuthorName', label: 'Author' },
              { key: 'AuthorType', label: 'Type' },
              { key: 'PublishedAt', label: 'Published', render: (date) => new Date(date).toLocaleDateString() },
              { key: 'Priority', label: 'Priority' },
              { key: 'IsPinned', label: 'Pinned', render: (pinned) => pinned ? '📌' : '' }
            ]}
            actions={[
              { label: 'View', icon: Eye, className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
                onClick: (item) => alert(`Notice: ${item.NoticeTitle}\n\n${item.NoticeDescription}`) },
              { label: 'Delete', icon: Trash2, className: 'bg-red-100 text-red-800 hover:bg-red-200',
                onClick: (item) => handleAction('delete', 'Notice', item.NoticeId) }
            ]}
          />
        );

      case 'courses':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
              <button
                onClick={() => openModal('addCourse')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </button>
            </div>
            <DataTable
              data={filteredCourses}
              columns={[
                { key: 'CourseId', label: 'ID' },
                { key: 'CourseName', label: 'Course Name' }
              ]}
              actions={[
                { label: 'Edit', icon: Edit, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
                  onClick: (item) => openModal('editCourse', item) },
                { label: 'Delete', icon: Trash2, className: 'bg-red-100 text-red-800 hover:bg-red-200',
                  onClick: (item) => handleAction('delete', 'Course', item.CourseId) }
              ]}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <div className="h-4 w-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-xl font-bold">Quick Board Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <button onClick={() => localStorage.clear() || window.location.reload()} 
                className="text-red-600 hover:text-red-700">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'faculty', label: 'Faculty', icon: GraduationCap },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'notices', label: 'Notices', icon: FileText },
            { id: 'courses', label: 'Courses', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab !== 'overview' && (
          <div className="mb-6 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500">
              {activeTab === 'faculty' && `${filteredFaculties.length} results`}
              {activeTab === 'students' && `${filterData(students, ['StudentName', 'StudentMail', 'CourseName']).length} results`}
              {activeTab === 'notices' && `${filterData(notices, ['NoticeTitle', 'NoticeDescription', 'AuthorName']).length} results`}
              {activeTab === 'courses' && `${filterData(courses, ['CourseName']).length} results`}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading...</span>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 className="text-lg font-semibold mb-4">
            {modalType === 'addCourse' ? 'Add New Course' : 'Edit Course'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
              <input
                type="text"
                value={courseForm.CourseName}
                onChange={(e) => setCourseForm({ CourseName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course name"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => handleAction(
                  modalType === 'addCourse' ? 'add' : 'edit',
                  'Course',
                  selectedItem?.CourseId,
                  courseForm
                )}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {modalType === 'addCourse' ? 'Add Course' : 'Update Course'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;