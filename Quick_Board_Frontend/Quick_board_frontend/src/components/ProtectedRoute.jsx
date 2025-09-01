// src/components/auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('authToken'); // fix naming
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.id || !user.role) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (requiredRole && user.role !== requiredRole) {
    // redirect user to their own dashboard instead of login
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty-dashboard" replace />;
    if (user.role === 'student') return <Navigate to="/student-dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
