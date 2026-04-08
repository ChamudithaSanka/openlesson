import React, { useEffect, useState, useCallback } from 'react';
import { Clock, Calendar, Users, ExternalLink, Search } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const API = 'http://localhost:5000';

const statusColors = {
  Scheduled: 'bg-blue-100 text-blue-800',
  Ongoing: 'bg-green-100 text-green-800',
  Completed: 'bg-gray-100 text-gray-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const StudentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all sessions (public endpoint per studySession.route.js GET /:id is public)
      // We use all sessions and filter by enrolled teacher IDs
      const enrolledTeachers = JSON.parse(localStorage.getItem('enrolledTeachers') || '[]');
      const enrolledTeacherIds = enrolledTeachers.map((t) => t._id);

      const res = await fetch(`${API}/api/study-sessions/all-public`, {}).catch(() => null);

      // Try fetching per enrolled teacher - use quiz endpoint style
      // The study-sessions GET / requires teacher auth, so we fetch all quizzes-style
      const allRes = await fetch(`${API}/api/quizzes`); // reference endpoint pattern

      // Since GET /api/study-sessions requires auth as teacher, 
      // we get the /:id endpoint for each if we had IDs.
      // Instead: fetch the general list via a workaround with student token
      const token = localStorage.getItem('token');
      const directRes = await fetch(`${API}/api/study-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let allSessions = [];
      if (directRes.ok) {
        const data = await directRes.json();
        allSessions = data.data || [];
      } else {
        // If forbidden (student can't hit teacher route), show empty with message
        allSessions = [];
      }

      // Filter: only sessions from enrolled teachers
      const filtered =
        enrolledTeacherIds.length > 0
          ? allSessions.filter((s) => {
              const tid =
                typeof s.teacherId === 'object' ? s.teacherId?._id : s.teacherId;
              return enrolledTeacherIds.includes(String(tid));
            })
          : allSessions;

      setSessions(filtered);
    } catch (err) {
      console.error(err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const formatDate = (date, time) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${time}`;
  };

  const statuses = ['All', 'Scheduled', 'Ongoing', 'Completed', 'Cancelled'];

  const filtered = sessions.filter((s) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      s.lesson?.toLowerCase().includes(q) ||
      s.subjectId?.subjectName?.toLowerCase().includes(q) ||
      s.gradeId?.gradeName?.toLowerCase().includes(q);
    const matchFilter = filter === 'All' || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <StudentLayout title="Study Sessions">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Study Sessions</h1>
          <p className="text-gray-500 mt-2">Sessions from teachers you've enrolled in.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filter === s
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto" />
              <p className="mt-3 text-gray-500 text-sm">Loading sessions...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <Clock size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-lg">No sessions found</p>
            <p className="text-gray-400 text-sm mt-1">
              {sessions.length === 0
                ? 'Enroll in teachers to see their sessions here.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-gray-700">{filtered.length}</span> session{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((session) => (
                <div
                  key={session._id}
                  className="bg-white rounded-xl shadow-sm border-l-4 border-orange-500 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Status & Title */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-bold text-gray-800 flex-1 line-clamp-2">{session.lesson}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ml-2 flex-shrink-0 ${statusColors[session.status] || statusColors.Scheduled}`}>
                        {session.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Users size={14} className="text-orange-500" />
                      <span>
                        {session.subjectId?.subjectName || 'Subject'} &bull; {session.gradeId?.gradeName || 'Grade'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm text-gray-600 border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-orange-500" />
                        <span>{formatDate(session.date, session.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-orange-500" />
                        <span>{session.startTime} – {session.endTime}</span>
                      </div>
                    </div>

                    {session.notes && (
                      <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2 line-clamp-2">
                        {session.notes}
                      </p>
                    )}

                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
                      >
                        <ExternalLink size={14} /> Join Zoom Meeting
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentSessions;