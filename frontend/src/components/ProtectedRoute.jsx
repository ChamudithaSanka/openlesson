import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children, allowedRoles = ['admin'] }) => {
  const { token, userType } = useAuth();

  if (!token || !allowedRoles.includes(userType)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
