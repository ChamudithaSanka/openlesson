import React from 'react';
import { Bell, Search } from 'lucide-react';

const StudentTopbar = ({ title }) => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const displayName = user?.profile?.fullName || user?.email || 'Student';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="student-header bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-40 backdrop-blur-md bg-white/90">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title || 'Dashboard'}</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Subtle Search & Notifications icons */}
        <div className="hidden md:flex items-center gap-4 text-slate-400 mr-2">
          <button className="hover:text-indigo-600 transition-colors">
            <Search size={20} />
          </button>
          <button className="hover:text-indigo-600 transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none">{displayName}</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Student Account</p>
          </div>
          
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:shadow-md transition-all duration-300">
              {initial}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentTopbar;
