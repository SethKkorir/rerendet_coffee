// src/components/Admin/AdminRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const AdminRoute = ({ children, requiredRole = 'admin' }) => {
  const { user } = useContext(AppContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  const adminRoles = ['admin', 'super_admin', 'moderator', 'support'];
  if (!adminRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Role-based access control
  const roleHierarchy = {
    support: ['support'],
    moderator: ['support', 'moderator'],
    admin: ['support', 'moderator', 'admin'],
    super_admin: ['support', 'moderator', 'admin', 'super_admin']
  };

  if (!roleHierarchy[requiredRole]?.includes(user.role)) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;