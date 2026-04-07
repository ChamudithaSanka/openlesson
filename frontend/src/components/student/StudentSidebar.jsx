import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  Library,
  Clock,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  {
    group: null,
    items: [
      { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'hover:bg-indigo-600/10 hover:text-indigo-400', activeColor: 'bg-blue-600' },
    ],
  },
  {
    group: 'Explore',
    items: [
      { to: '/student/teachers', label: 'All Teachers', icon: Users, activeColor: 'bg-blue-600' },
      { to: '/student/subjects', label: 'All Subjects', icon: BookOpen, activeColor: 'bg-blue-600' },
    ],
  },
  {
    group: 'My Classroom',
    items: [
      { to: '/student/enrolled-teachers', label: 'My Teachers', icon: UserCheck, activeColor: 'bg-blue-600' },
      { to: '/student/enrolled-subjects', label: 'My Subjects', icon: Library, activeColor: 'bg-blue-600' },
      { to: '/student/sessions', label: 'Study Sessions', icon: Clock, activeColor: 'bg-blue-600' },
      { to: '/student/quizzes', label: 'My Quizzes', icon: HelpCircle, activeColor: 'bg-blue-600' },
    ],
  },
  {
    group: 'Support',
    items: [
      { to: '/student/feedback', label: 'Feedback', icon: MessageSquare, activeColor: 'bg-blue-600' },
      { to: '/student/complaints', label: 'Complaints', icon: AlertTriangle, activeColor: 'bg-blue-600' },
    ],
  },
];

const StudentSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shadow-2xl z-50">
      {/* Brand */}
      <div className="px-6 py-8 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            OL
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">Student</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">OpenLesson v1.0</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7 custom-scrollbar">
        {navItems.map((section, si) => (
          <div key={si}>
            {section.group && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3 px-3">
                {section.group}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map(({ to, label, icon: Icon, activeColor }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive(to)
                      ? `${activeColor} text-white shadow-lg shadow-blue-900/20`
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive(to) ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'} />
                    <span>{label}</span>
                  </div>
                  {isActive(to) && <ChevronRight size={14} className="text-white/50" />}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile & Logout */}
      <div className="px-4 py-6 border-t border-slate-800/50 space-y-4">
        <Link 
          to="/student/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            isActive('/student/profile') 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <User size={18} />
          <span>My Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
        >
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;