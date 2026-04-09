import React, { useEffect, useState, useCallback } from 'react';
import { Search, UserCheck, BookOpen, CheckCircle, ChevronRight } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const API = 'http://localhost:5000';

const TEACHER_THEMES = [
  { bg: 'from-indigo-500 to-indigo-700', light: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  { bg: 'from-cyan-500 to-cyan-700', light: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', btn: 'bg-cyan-600 hover:bg-cyan-700' },
  { bg: 'from-teal-500 to-teal-700', light: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', btn: 'bg-teal-600 hover:bg-teal-700' },
  { bg: 'from-blue-500 to-blue-700', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', btn: 'bg-blue-600 hover:bg-blue-700' },
  { bg: 'from-violet-500 to-violet-700', light: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', btn: 'bg-violet-600 hover:bg-violet-700' },
  { bg: 'from-sky-500 to-sky-700', light: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', btn: 'bg-sky-600 hover:bg-sky-700' },
];

const StudentTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [enrollingId, setEnrollingId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/teachers`);
      const data = await res.json();
      const approved = (data.teachers || []).filter((t) => t.status === 'Approved');
      setTeachers(approved);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('enrolledTeachers') || '[]');
    setEnrolledIds(saved.map((t) => t._id));
    fetchTeachers();
  }, [fetchTeachers]);

  const handleEnroll = async (teacher) => {
    if (enrolledIds.includes(teacher._id)) return;

    setEnrollingId(teacher._id);

    try {
      const current = JSON.parse(localStorage.getItem('enrolledTeachers') || '[]');
      const updated = [...current, teacher];
      localStorage.setItem('enrolledTeachers', JSON.stringify(updated));
      setEnrolledIds((prev) => [...prev, teacher._id]);

      // auto add subjects
      const currentSubjects = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');
      const teacherSubjects = teacher.subjectsTheyTeach || [];

      const newSubjects = teacherSubjects.filter(
        (s) => !currentSubjects.some((cs) => cs._id === s._id)
      );

      localStorage.setItem(
        'enrolledSubjects',
        JSON.stringify([...currentSubjects, ...newSubjects])
      );

      showToast(`Enrolled in ${teacher.fullName}!`);
    } catch (err) {
      showToast('Enrollment failed');
    } finally {
      setEnrollingId(null);
    }
  };

  const filtered = teachers.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.fullName?.toLowerCase().includes(q) ||
      t.subjectsTheyTeach?.some((s) => s.subjectName?.toLowerCase().includes(q)) ||
      t.gradesTheyTeach?.some((g) => g.gradeName?.toLowerCase().includes(q))
    );
  });

  return (
    <StudentLayout title="Explore Teachers">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} className="text-green-400" /> {toast}
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Explore Teachers</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Discover volunteer teachers and enroll to start learning.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search size={17} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
              <p className="mt-3 text-gray-400 text-sm">Loading teachers...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <UserCheck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No teachers found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Showing <span className="font-semibold text-gray-800">{filtered.length}</span>{' '}
              teacher{filtered.length !== 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((teacher, idx) => {
                const isEnrolled = enrolledIds.includes(teacher._id);
                const isLoadingThis = enrollingId === teacher._id;
                const theme = TEACHER_THEMES[idx % TEACHER_THEMES.length];

                return (
                  <div
                    key={teacher._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    {/* Top bar */}
                    <div className={`bg-gradient-to-r ${theme.bg} h-1.5 w-full`} />

                    <div className="p-5 flex flex-col flex-1">
                      {/* Icon + badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${theme.light} ${theme.border} border p-3 rounded-xl`}>
                          <UserCheck className={theme.text} size={22} />
                        </div>

                        {isEnrolled && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                            <CheckCircle size={11} /> Enrolled
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="text-base font-bold text-gray-900">
                        {teacher.fullName}
                      </h3>

                      {/* Qualification */}
                      {teacher.qualification && (
                        <p className="text-gray-500 text-sm mt-1">
                          {teacher.qualification}
                        </p>
                      )}

                      {/* Subjects */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {teacher.subjectsTheyTeach?.map((s) => (
                          <span
                            key={s._id}
                            className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium"
                          >
                            {s.subjectName}
                          </span>
                        ))}
                      </div>

                      {/* Grades */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {teacher.gradesTheyTeach?.map((g) => (
                          <span
                            key={g._id}
                            className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium"
                          >
                            {g.gradeName}
                          </span>
                        ))}
                      </div>

                      <div className="flex-1" />

                      {/* CTA */}
                      <div className="mt-5 pt-4 border-t border-gray-100">
                        {isEnrolled ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                              <CheckCircle size={14} /> You're enrolled
                            </span>
                            <span className={`text-xs font-medium ${theme.text} flex items-center gap-0.5`}>
                              View <ChevronRight size={13} />
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnroll(teacher)}
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

export default StudentTeachers;