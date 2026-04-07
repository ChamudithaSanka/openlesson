import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('token');

  if (!token || userType !== 'admin') {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;
