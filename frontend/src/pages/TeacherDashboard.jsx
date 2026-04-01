import React, { useEffect } from 'react';
import TeacherLayout from '../components/TeacherLayout';

const TeacherDashboard = () => {
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'teacher') {
      window.location.href = '/login';
    }
  }, []);

  return (
    <TeacherLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your teacher portal</p>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700">Dashboard content will be added here.</p>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
