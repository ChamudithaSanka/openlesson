import React from 'react';
import TeacherSidebar from './TeacherSidebar';

const TeacherLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <TeacherSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default TeacherLayout;
