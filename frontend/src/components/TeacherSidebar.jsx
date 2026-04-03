import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, Clock } from 'lucide-react';

const TeacherSidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-slate-800 text-white p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">Teacher Panel</h1>
      
      <nav className="flex-1 space-y-2">
        <Link
          to="/teacher/dashboard"
          className={`flex items-center gap-3 p-3 rounded-lg transition ${
            isActive('/teacher/dashboard')
              ? 'bg-indigo-600'
              : 'hover:bg-slate-700'
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/teacher/study-materials"
          className={`flex items-center gap-3 p-3 rounded-lg transition ${
            isActive('/teacher/study-materials')
              ? 'bg-purple-600'
              : 'hover:bg-slate-700'
          }`}
        >
          <FileText size={20} />
          <span>Study Materials</span>
        </Link>

        <Link
          to="/teacher/study-sessions"
          className={`flex items-center gap-3 p-3 rounded-lg transition ${
            isActive('/teacher/study-sessions')
              ? 'bg-cyan-600'
              : 'hover:bg-slate-700'
          }`}
        >
          <Clock size={20} />
          <span>Study Sessions</span>
        </Link>

        <Link
          to="/teacher/quizzes"
          className={`flex items-center gap-3 p-3 rounded-lg transition ${
            isActive('/teacher/quizzes')
              ? 'bg-green-600'
              : 'hover:bg-slate-700'
          }`}
        >
          <BookOpen size={20} />
          <span>Quizzes</span>
        </Link>
      </nav>
    </div>
  );
};

export default TeacherSidebar;
