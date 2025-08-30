// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Redirect admin users to admin dashboard
  if (user.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  // For Faculty and Student users - you can implement their dashboards later
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user.name}!
          </h1>
          <p className="text-gray-600">
            Your role: <span className="font-medium">{user.role}</span>
          </p>
          
          {user.role === 'Faculty' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">Faculty dashboard coming soon...</p>
            </div>
          )}
          
          {user.role === 'Student' && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800">Student dashboard coming soon...</p>
            </div>
          )}

          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="mt-6 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;