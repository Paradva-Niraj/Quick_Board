// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Check if user is authenticated
  if (!token || !user.id) {
    return <Navigate to="/login" replace />;
  }

  // Check if specific role is required
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (user.role === 'Admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'Faculty') {
      return <Navigate to="/faculty-dashboard" replace />;
    } else if (user.role === 'Student') {
      return <Navigate to="/student-dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If no specific role required, but user is admin, redirect to admin dashboard
  if (!requiredRole && user.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;