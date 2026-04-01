import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, Users, Wallet, ChevronDown, BookOpen, BookMarked } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const [expandManageUsers, setExpandManageUsers] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isManageUsersActive = location.pathname.startsWith('/admin/manage-users');

  return (
    <div className="w-64 bg-slate-800 text-white p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
      
      <nav className="flex-1 space-y-2">
        <Link
          to="/admin/complaints"
          className={`flex items-center gap-3 p-3 rounded-lg transition ${
            isActive('/admin/complaints')
              ? 'bg-blue-600'
              : 'hover:bg-slate-700'
          }`}
        >
          <AlertCircle size={20} />
          <span>Manage Complaints</span>
        </Link>

        {/* Manage Users Section */}
        <div>
          <button
            onClick={() => setExpandManageUsers(!expandManageUsers)}
            className={`flex items-center gap-3 p-3 rounded-lg transition w-full ${
              isManageUsersActive
                ? 'bg-blue-600'
                : 'hover:bg-slate-700'
            }`}
          >
            <Users size={20} />
            <span>Manage Users</span>
            <ChevronDown size={16} className={`ml-auto transform transition ${expandManageUsers ? 'rotate-180' : ''}`} />
          </button>

          {/* Subsection - Teachers, Students and Donors */}
          {expandManageUsers && (
            <div className="ml-4 mt-2 space-y-2">
              <Link
                to="/admin/manage-users/teachers"
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive('/admin/manage-users/teachers')
                    ? 'bg-green-600'
                    : 'hover:bg-slate-600'
                }`}
              >
                <span className="text-sm">Teachers</span>
              </Link>
              <Link
                to="/admin/manage-users/students"
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive('/admin/manage-users/students')
                    ? 'bg-green-600'
                    : 'hover:bg-slate-600'
                }`}
              >
                <span className="text-sm">Students</span>
              </Link>
              <Link
                to="/admin/manage-users/donors"
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive('/admin/manage-users/donors')
                    ? 'bg-green-600'
                    : 'hover:bg-slate-600'
                }`}
              >
                <span className="text-sm">Donors</span>
              </Link>
            </div>
          )}
        </div>

        {/* Manage Donations Section */}
        <Link
          to="/admin/manage-donations"
          className={`flex items-center gap-3 p-3 rounded-lg transition ${
            isActive('/admin/manage-donations')
              ? 'bg-blue-600'
              : 'hover:bg-slate-700'
          }`}
        >
          <Wallet size={20} />
          <span>Manage Donations</span>
        </Link>

        {/* Grade Management Section */}
        <Link
          to="/admin/grades"
          className={`flex items-center gap-3 p-3 rounded-lg transition ${
            isActive('/admin/grades')
              ? 'bg-blue-600'
              : 'hover:bg-slate-700'
          }`}
        >
          <BookOpen size={20} />
          <span>Manage Grades</span>
        </Link>

        {/* Subject Management Section */}
        <Link
          to="/admin/subjects"
          className={`flex items-center gap-3 p-3 rounded-lg transition ${
            isActive('/admin/subjects')
              ? 'bg-blue-600'
              : 'hover:bg-slate-700'
          }`}
        >
          <BookMarked size={20} />
          <span>Manage Subjects</span>
        </Link>
      </nav>
    </div>
  );
};

export default AdminSidebar;
