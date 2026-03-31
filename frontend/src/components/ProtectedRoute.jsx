import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = ['admin'] }) => {
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');

  if (!token || !allowedRoles.includes(userType)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
