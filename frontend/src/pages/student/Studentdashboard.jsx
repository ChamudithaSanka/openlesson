import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Clock, HelpCircle, UserCheck, Library, ArrowRight } from 'lucide-react';
import StudentLayout from '../../components/student/Studentlayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [stats, setStats] = useState({
    enrolledTeachers: 0,
    enrolledSubjects: 0,
    upcomingSessions: 0,
    availableQuizzes: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch student profile
      const profileRes = await fetch(`${API}/api/students/my-profile`, config);
      const profileData = await profileRes.json();
      if (profileData.success) setStudentData(profileData.student);

      // Fetch enrolled teachers count
      const teachersRes = await fetch(`${API}/api/teachers`, config);
      const teachersData = await teachersRes.json();

      // Fetch sessions
      const sessionsRes = await fetch(`${API}/api/study-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // sessions may fail if student is not authorized - that's fine
      let sessionCount = 0;
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        const all = sessionsData.data || [];
        sessionCount = all.filter((s) => s.status === 'Scheduled').length;
      }

      // Fetch quizzes
      const quizzesRes = await fetch(`${API}/api/quizzes`);
      const quizzesData = await quizzesRes.json();

      // Fetch enrolled info from localStorage (we store enrollments client-side)
      const enrolled = JSON.parse(localStorage.getItem('enrolledTeachers') || '[]');
      const enrolledSubjects = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');

      setStats({
        enrolledTeachers: enrolled.length,
        enrolledSubjects: enrolledSubjects.length,
        upcomingSessions: sessionCount,
        availableQuizzes: quizzesData.count || 0,
      });
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'student') {
      window.location.href = '/login';
      return;
    }
    fetchDashboardData();
  }, [fetchDashboardData]);

  const firstName = studentData?.fullName?.split(' ')[0] || 'Student';

  const statCards = [
    {
      label: 'Enrolled Teachers',
      value: stats.enrolledTeachers,
      icon: UserCheck,
      color: 'bg-green-600',
      to: '/student/enrolled-teachers',
    },
    {
      label: 'Enrolled Subjects',
      value: stats.enrolledSubjects,
      icon: Library,
      color: 'bg-teal-600',
      to: '/student/enrolled-subjects',
    },
    {
      label: 'Upcoming Sessions',
      value: stats.upcomingSessions,
      icon: Clock,
      color: 'bg-orange-500',
      to: '/student/sessions',
    },
    {
      label: 'Available Quizzes',
      value: stats.availableQuizzes,
      icon: HelpCircle,
      color: 'bg-yellow-500',
      to: '/student/quizzes',
    },
  ];

  const quickActions = [
    { label: 'Explore Teachers', to: '/student/teachers', icon: Users, color: 'bg-blue-600' },
    { label: 'Explore Subjects', to: '/student/subjects', icon: BookOpen, color: 'bg-cyan-600' },
    { label: 'View Sessions', to: '/student/sessions', icon: Clock, color: 'bg-orange-500' },
    { label: 'Take a Quiz', to: '/student/quizzes', icon: HelpCircle, color: 'bg-yellow-500' },
  ];

  if (loading) {
    return (
      <StudentLayout title="Dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Dashboard">
      <div className="p-8 space-y-10">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 rounded-[2rem] p-10 text-white shadow-xl shadow-indigo-200/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-indigo-100/80 text-xs font-bold uppercase tracking-[0.2em] mb-2">Academic Overview</p>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">{firstName}</span> 👋
              </h1>
              <p className="text-indigo-50/80 mt-2 max-w-md text-base leading-relaxed font-medium">
                Keep up the great work! You've got <span className="text-white font-bold">{stats.upcomingSessions} sessions</span> scheduled this week.
              </p>
              {studentData?.gradeId?.gradeName && (
                <div className="mt-6 flex items-center gap-2">
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                    {studentData.gradeId.gradeName} Student
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                  <span className="text-xs font-semibold text-indigo-100">Profile Active</span>
                </div>
              )}
            </div>
            
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center rotate-3 shadow-2xl">
                <BookOpen size={48} className="text-white/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map(({ label, value, icon: Icon, color, to }) => (
            <Link
              key={label}
              to={to}
              className="group relative bg-white/60 rounded-2xl p-6 border border-transparent hover:border-indigo-100 shadow-sm hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-2 hover:scale-105 overflow-hidden backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-transform duration-300 group-hover:scale-110`}>
                  <div className="w-full h-full flex items-center justify-center rounded-2xl">
                    <Icon size={22} />
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ArrowRight size={18} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
                <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-6 -right-6 opacity-0 group-hover:opacity-50 transition-opacity duration-700 text-slate-100">
                <Icon size={80} />
              </div>
              <div aria-hidden="true" className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="xl:col-span-2">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
              Recommended for You
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {quickActions.map(({ label, to, icon: Icon, color }) => (
                <Link
                  key={label}
                  to={to}
                  className="group relative bg-white rounded-3xl border border-transparent p-6 flex flex-col items-center gap-4 hover:shadow-xl transition-transform duration-300 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
                >
                  <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-transform duration-300 group-hover:rotate-12 shadow-md`}> 
                    <Icon size={26} />
                  </div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest text-center">{label}</span>
                  <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-white/40 to-transparent pointer-events-none" />
                </Link>
              ))}
            </div>
          </div>

          {/* Profile Quick View */}
          <div className="bg-gradient-to-br from-indigo-100 via-blue-50 to-blue-200 rounded-[2rem] border border-blue-100 p-8 shadow-md backdrop-blur-sm hover:shadow-lg transition-transform duration-300 transform hover:-translate-y-1">
            <h2 className="text-lg font-black text-slate-800 mb-6 tracking-tight">Your Identity</h2>
            {studentData ? (
              <div className="space-y-4">
                {[
                  ['Full Name', studentData.fullName],
                  ['Grade', studentData.gradeId?.gradeName || '-'],
                  ['Education', studentData.schoolName || '-'],
                  ['Status', studentData.status],
                ].map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{key}</span>
                    <span className="text-sm font-black text-slate-700 max-w-[150px] truncate">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Users size={32} />
                 </div>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed">Profile summary is temporarily unavailable.</p>
              </div>
            )}
            <Link
              to="/student/profile"
              className="flex items-center justify-center gap-2 mt-8 w-full py-4 bg-indigo-50/70 rounded-2xl text-sm font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm"
            >
              Manage Profile <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;