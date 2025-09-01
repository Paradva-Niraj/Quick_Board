import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Eye,
  BookOpen,
  GraduationCap,
  FileText,
  Settings,
  Bell,
  LogOut,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Clock,
  Mail,
  User,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { authAPI } from '../api/authApi';

// Mock data for counts (you'll replace this with real API calls)
const mockCounts = {
  faculty: 25,
  students: 150,
  notices: 12,
  courses: 8
};

const AdminDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const [userInfo, setUserInfo] = useState(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [adminForm, setAdminForm] = useState({
    AdminName: '',
    AdminMail: '',
    AdminPassword: ''
  });

  useEffect(() => {
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem('userInfo') || localStorage.getItem('user');
    const lastLogin = localStorage.getItem('lastLogin');
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (error) {
        console.error('Error parsing user info:', error);
        setUserInfo({ name: 'Admin' });
      }
    }

    if (!lastLogin) {
      setIsFirstLogin(true);
      localStorage.setItem('lastLogin', new Date().toISOString());
    }

    if (activeComponent === 'admins') {
      fetchAllAdmins();
    }
  }, [activeComponent]);

  const fetchAllAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authAPI.apiCall('/Admin', {
        method: 'GET'
      });

      // Handle the response structure - it might be an array directly or wrapped in an object
      if (Array.isArray(data)) {
        setAdmins(data);
      } else if (data && Array.isArray(data.admins)) {
        setAdmins(data.admins);
      } else {
        console.warn('Unexpected admin data structure:', data);
        setAdmins([]);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to fetch admins: ' + (error.message || 'Unknown error'));
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!adminForm.AdminName || !adminForm.AdminMail || !adminForm.AdminPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      await authAPI.apiCall('/Admin', {
        method: 'POST',
        body: JSON.stringify(adminForm)
      });

      setShowAddAdminModal(false);
      setAdminForm({ AdminName: '', AdminMail: '', AdminPassword: '' });
      fetchAllAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Failed to add admin: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!adminForm.AdminName || !adminForm.AdminMail) {
      setError('Name and email are required');
      setLoading(false);
      return;
    }

    try {
      await authAPI.apiCall(`/Admin/${selectedAdmin.adminId}`, {
        method: 'PUT',
        body: JSON.stringify(adminForm)
      });

      setShowEditAdminModal(false);
      setSelectedAdmin(null);
      setAdminForm({ AdminName: '', AdminMail: '', AdminPassword: '' });
      fetchAllAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      setError('Failed to update admin: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      setLoading(true);
      setError('');
      try {
        await authAPI.apiCall(`/Admin/${id}`, {
          method: 'DELETE'
        });

        fetchAllAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
        setError('Failed to delete admin: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setAdminForm({
      AdminName: admin.adminName || admin.AdminName || '',
      AdminMail: admin.adminMail || admin.AdminMail || '',
      AdminPassword: ''
    });
    setShowEditAdminModal(true);
  };

  const resetForm = () => {
    setAdminForm({ AdminName: '', AdminMail: '', AdminPassword: '' });
    setError('');
    setSelectedAdmin(null);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      authAPI.logout();
    }
  };

  // Safe filtering with null checks
  const filteredAdmins = admins.filter(admin => {
    if (!admin) return false;
    const name = admin.adminName || admin.AdminName || '';
    const email = admin.adminMail || admin.AdminMail || '';
    const searchLower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
  });

  // First Login Welcome Screen
  if (isFirstLogin && userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
            <div className="h-6 w-6 bg-white rounded-sm"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome!</h1>
          <p className="text-gray-600 mb-6">
            Hello <span className="font-semibold text-blue-600">{userInfo.name || userInfo.AdminName || 'Admin'}</span>,
            welcome to your Admin Dashboard. This is your first time logging in.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700">
              <Clock className="w-4 h-4 inline mr-2" />
              Login Time: {new Date().toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setIsFirstLogin(false)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="h-6 w-6 bg-white rounded-md"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">NoticeBoard</h2>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Settings },
              { id: 'admins', label: 'Manage Admins', icon: Users },
              { id: 'faculty', label: 'Faculty', icon: UserPlus },
              { id: 'students', label: 'Students', icon: GraduationCap },
              { id: 'notices', label: 'Notices', icon: FileText },
              { id: 'courses', label: 'Courses', icon: BookOpen },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveComponent(item.id);
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeComponent === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:transform hover:scale-105'
                  }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:transform hover:scale-105"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200 shadow-sm"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <div className="h-4 w-4 bg-white rounded-sm"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">NoticeBoard</h1>
              <p className="text-xs text-gray-500 -mt-1">Admin Panel</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 shadow-sm"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const DashboardContent = () => (
    <div className="p-4 lg:p-6">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back, {userInfo?.name || userInfo?.AdminName || 'Admin'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {[
          { label: 'Faculty', count: mockCounts.faculty, icon: UserPlus, color: 'from-green-500 to-emerald-600' },
          { label: 'Students', count: mockCounts.students, icon: GraduationCap, color: 'from-blue-500 to-indigo-600' },
          { label: 'Notices', count: mockCounts.notices, icon: FileText, color: 'from-purple-500 to-violet-600' },
          { label: 'Courses', count: mockCounts.courses, icon: BookOpen, color: 'from-orange-500 to-red-600' },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-4 lg:p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{item.label}</p>
                <p className="text-2xl lg:text-3xl font-bold text-gray-800 mt-1">{item.count}</p>
              </div>
              <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}>
                <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'New notice published', time: '2 hours ago', icon: FileText },
            { action: 'Faculty member added', time: '4 hours ago', icon: UserPlus },
            { action: 'Student enrolled in course', time: '6 hours ago', icon: GraduationCap },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <activity.icon className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium truncate">{activity.action}</p>
                <p className="text-gray-500 text-sm">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AdminsContent = () => (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Manage Admins</h1>
          <p className="text-gray-600">Add, edit, and manage admin accounts</p>
        </div>
        <button
          onClick={() => setShowAddAdminModal(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Add Admin</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              autoComplete="off"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admins...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Admin</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-medium text-gray-500">ID</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.adminId || admin.AdminId} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                        </div>
                        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {admin.adminName || admin.AdminName || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="truncate max-w-xs">
                        {admin.adminMail || admin.AdminMail || 'No email'}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-500">
                      #{admin.adminId || admin.AdminId || 'N/A'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.adminId || admin.AdminId)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-gray-200/50 flex items-center justify-center z-50 p-4">
        {/* 🔹 Changed backdrop to light gray blur (not black) */}
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };


  const AdminForm = ({ onSubmit, isEdit = false }) => {
    // 🔹 Single input handler (less re-renders)
    const handleChange = (e) => {
      const { name, value } = e.target;
      setAdminForm((prev) => ({ ...prev, [name]: value }));
    };

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
        className="space-y-4"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="AdminName" className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            id="AdminName"
            name="AdminName"
            type="text"
            value={adminForm.AdminName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     outline-none transition-all duration-200"
            placeholder="Enter admin name"
            autoComplete="off"
            autoFocus={!isEdit}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="AdminMail" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="AdminMail"
            name="AdminMail"
            type="email"
            value={adminForm.AdminMail}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     outline-none transition-all duration-200"
            placeholder="Enter admin email"
            autoComplete="off"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="AdminPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="AdminPassword"
            name="AdminPassword"
            type="password"
            value={adminForm.AdminPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                     outline-none transition-all duration-200"
            placeholder={isEdit ? "Leave empty to keep current password" : "Enter admin password"}
            autoComplete="new-password"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
                     py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 
                     transition-all duration-200 disabled:opacity-50 
                     disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update' : 'Add')} Admin
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddAdminModal(false);
              setShowEditAdminModal(false);
            }}
            className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg 
                     hover:bg-gray-600 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };

  // Placeholder components for other sections
  const PlaceholderContent = ({ title }) => (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 text-center">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
        </div>
        <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">{title} Management</h3>
        <p className="text-gray-500">This section is under development. Coming soon!</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <DashboardContent />;
      case 'admins':
        return <AdminsContent />;
      case 'faculty':
        return <PlaceholderContent title="Faculty" />;
      case 'students':
        return <PlaceholderContent title="Students" />;
      case 'notices':
        return <PlaceholderContent title="Notices" />;
      case 'courses':
        return <PlaceholderContent title="Courses" />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Header />
      <Sidebar />

      {/* 🔹 Overlay now light gray blur instead of solid black */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-gray-200/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 overflow-auto">{renderContent()}</div>

      {/* Modals */}
      <Modal
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        title="Add New Admin"
      >
        <AdminForm onSubmit={handleAddAdmin} />
      </Modal>

      <Modal
        isOpen={showEditAdminModal}
        onClose={() => setShowEditAdminModal(false)}
        title="Edit Admin"
      >
        <AdminForm onSubmit={handleUpdateAdmin} isEdit={true} />
      </Modal>
    </div>
  );
};

export default AdminDashboard;