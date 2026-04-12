import React, { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen, CheckCircle, ChevronRight } from 'lucide-react';
import StudentLayout from '../../components/student/Studentlayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SUBJECT_THEMES = [
  { bg: 'from-indigo-500 to-indigo-700',  light: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  btn: 'bg-indigo-600 hover:bg-indigo-700'  },
  { bg: 'from-cyan-500 to-cyan-700',      light: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    btn: 'bg-cyan-600 hover:bg-cyan-700'      },
  { bg: 'from-teal-500 to-teal-700',      light: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    btn: 'bg-teal-600 hover:bg-teal-700'      },
  { bg: 'from-blue-500 to-blue-700',      light: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    btn: 'bg-blue-600 hover:bg-blue-700'      },
  { bg: 'from-violet-500 to-violet-700',  light: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  btn: 'bg-violet-600 hover:bg-violet-700'  },
  { bg: 'from-sky-500 to-sky-700',        light: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     btn: 'bg-sky-600 hover:bg-sky-700'        },
];

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [enrolling, setEnrolling] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/subjects`);
      const data = await res.json();
      setSubjects(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch enrolled subjects from backend
    const fetchEnrolled = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API}/api/subject-enrollments/my-subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setEnrolledIds((data.subjects || []).map((s) => s._id));
          localStorage.setItem('enrolledSubjects', JSON.stringify(data.subjects || []));
        }
      } catch {}
    };
    fetchEnrolled();
    fetchSubjects();
  }, [fetchSubjects]);

  const handleEnroll = async (subject) => {
    if (enrolledIds.includes(subject._id)) return;
    setEnrolling(subject._id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/subject-enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subjectId: subject._id }),
      });
      if (res.ok) {
        setEnrolledIds((prev) => [...prev, subject._id]);
        // Optionally update localStorage for compatibility
        const current = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');
        const updated = [...current, subject];
        localStorage.setItem('enrolledSubjects', JSON.stringify(updated));
        showToast(`Enrolled in ${subject.subjectName}!`);
      } else {
        const data = await res.json();
        showToast(data.message || 'Enrollment failed');
      }
    } catch {
      showToast('Enrollment failed');
    }
    setEnrolling(null);
  };

  const filtered = subjects.filter(
    (s) =>
      s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StudentLayout title="Explore Subjects">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} className="text-green-400" /> {toast}
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Subjects</h1>
          <p className="text-gray-500 mt-1 text-sm">Browse all available subjects and enroll to start learning.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search size={17} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
              <p className="mt-3 text-gray-400 text-sm">Loading subjects...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No subjects found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Showing <span className="font-semibold text-gray-800">{filtered.length}</span>{' '}
              subject{filtered.length !== 1 ? 's' : ''}
              {enrolledIds.length > 0 && (
                <span className="ml-3 text-green-600 font-medium">
                  · {enrolledIds.length} enrolled
                </span>
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((subject, idx) => {
                const isEnrolled = enrolledIds.includes(subject._id);
                const isLoadingThis = enrolling === subject._id;
                const theme = SUBJECT_THEMES[idx % SUBJECT_THEMES.length];

                return (
                  <div
                    key={subject._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    {/* Thin colored top accent bar */}
                    <div className={`bg-gradient-to-r from-indigo-400 via-blue-300 to-cyan-300 h-1.5 w-full`} />

                    <div className="p-5 flex flex-col flex-1">
                      {/* Icon row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${theme.light} ${theme.border} border p-3 rounded-xl`}>
                          <BookOpen className={theme.text} size={22} />
                        </div>
                        {isEnrolled && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                            <CheckCircle size={11} /> Enrolled
                          </span>
                        )}
                      </div>

                      {/* Name & description */}
                      <h3 className="text-base font-bold text-gray-900">{subject.subjectName}</h3>
                      {subject.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-relaxed">
                          {subject.description}
                        </p>
                      )}

                      <div className="flex-1" />

                      {/* CTA — sits on clean white, no color clash */}
                      <div className="mt-5 pt-4 border-t border-gray-100">
                        {isEnrolled ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                              <CheckCircle size={14} /> You're enrolled
                            </span>
                            <span className={`text-xs font-medium ${theme.text} flex items-center gap-0.5`}>
                              Go to subject <ChevronRight size={13} />
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnroll(subject)}
                            disabled={isLoadingThis}
                            className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-sm ${theme.btn} disabled:opacity-70`}
                          >
                            {isLoadingThis ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Enrolling...
                              </>
                            ) : (
                              'Enroll Now'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentSubjects;