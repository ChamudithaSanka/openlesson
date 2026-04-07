import React, { useEffect } from 'react';
import StudentSidebar from './StudentSidebar';
import StudentTopbar from './StudentTopbar';

const StudentLayout = ({ children, title }) => {
  useEffect(() => {
    // Hide global header and footer
    const globalHeader = document.querySelector('header:not(.student-header)');
    const globalFooter = document.querySelector('footer');
    
    if (globalHeader) globalHeader.style.display = 'none';
    if (globalFooter) globalFooter.style.display = 'none';

    // Cleanup on unmount
    return () => {
      if (globalHeader) globalHeader.style.display = '';
      if (globalFooter) globalFooter.style.display = '';
    };
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      <StudentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentTopbar title={title} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-[#f8fafc] custom-scrollbar">
          <div className="max-w-[1600px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;