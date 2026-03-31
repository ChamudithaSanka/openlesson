import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, Users, ChevronDown } from 'lucide-react';

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

          {/* Subsection - Teachers */}
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
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
