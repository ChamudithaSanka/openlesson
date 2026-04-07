import React, { useEffect, useState, useCallback } from 'react';
import { Search, UserCheck, BookOpen, CheckCircle } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const API = 'http://localhost:5000';

const StudentTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [enrollingId, setEnrollingId] = useState(null);
  const [toast, setToast] = useState('');

  const token = localStorage.getItem('token');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/teachers`);
      const data = await res.json();
      // Only show approved teachers
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
      // Store enrollment in localStorage (client-side enrollment tracking)
      const current = JSON.parse(localStorage.getItem('enrolledTeachers') || '[]');
      const updated = [...current, teacher];
      localStorage.setItem('enrolledTeachers', JSON.stringify(updated));
      setEnrolledIds((prev) => [...prev, teacher._id]);

      // Also enroll in subjects of this teacher
      const currentSubjects = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');
      const teacherSubjects = teacher.subjectsTheyTeach || [];
      const newSubjects = teacherSubjects.filter(
        (s) => !currentSubjects.some((cs) => cs._id === s._id)
      );
      localStorage.setItem('enrolledSubjects', JSON.stringify([...currentSubjects, ...newSubjects]));

      showToast(`Enrolled in ${teacher.fullName} successfully!`);
    } catch (err) {
      showToast('Enrollment failed. Try again.');
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
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Explore Teachers</h1>
          <p className="text-gray-500 mt-2">Discover approved volunteer teachers and enroll to access their sessions and quizzes.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-lg">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, subject or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
              <p className="mt-3 text-gray-500 text-sm">Loading teachers...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <UserCheck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No teachers found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> teacher{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((teacher) => {
                const isEnrolled = enrolledIds.includes(teacher._id);
                const isEnrolling = enrollingId === teacher._id;
                return (
                  <div
                    key={teacher._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl">
                        {teacher.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{teacher.fullName}</h3>
                        {teacher.qualification && (
                          <p className="text-indigo-200 text-xs mt-0.5">{teacher.qualification}</p>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      {/* Subjects */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Subjects</p>
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.subjectsTheyTeach?.length > 0 ? (
                            teacher.subjectsTheyTeach.map((s) => (
                              <span key={s._id} className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
                                {s.subjectName}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">No subjects listed</span>
                          )}
                        </div>
                      </div>

                      {/* Grades */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Grades</p>
                        <div className="flex flex-wrap gap-1.5">
                          {teacher.gradesTheyTeach?.length > 0 ? (
                            teacher.gradesTheyTeach.map((g) => (
                              <span key={g._id} className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium">
                                {g.gradeName}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">No grades listed</span>
                          )}
                        </div>
                      </div>

                      {/* Enroll Button */}
                      <button
                        onClick={() => handleEnroll(teacher)}
                        disabled={isEnrolled || isEnrolling}
                        className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                          isEnrolled
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isEnrolled ? (
                          <><CheckCircle size={16} /> Enrolled</>
                        ) : isEnrolling ? (
                          'Enrolling...'
                        ) : (
                          <><BookOpen size={16} /> Enroll</>
                        )}
                      </button>
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