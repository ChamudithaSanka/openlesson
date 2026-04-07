import React, { useEffect, useState, useCallback } from 'react';
import { Search, BookOpen, CheckCircle } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const API = 'http://localhost:5000';

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrolledIds, setEnrolledIds] = useState([]);
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
    const saved = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');
    setEnrolledIds(saved.map((s) => s._id));
    fetchSubjects();
  }, [fetchSubjects]);

  const handleEnroll = (subject) => {
    if (enrolledIds.includes(subject._id)) return;
    const current = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');
    const updated = [...current, subject];
    localStorage.setItem('enrolledSubjects', JSON.stringify(updated));
    setEnrolledIds((prev) => [...prev, subject._id]);
    showToast(`Enrolled in ${subject.subjectName}!`);
  };

  const filtered = subjects.filter((s) =>
    s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const colors = [
    'from-indigo-500 to-indigo-700',
    'from-cyan-500 to-cyan-700',
    'from-teal-500 to-teal-700',
    'from-blue-500 to-blue-700',
    'from-violet-500 to-violet-700',
    'from-sky-500 to-sky-700',
  ];

  return (
    <StudentLayout title="Explore Subjects">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-cyan-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Explore Subjects</h1>
          <p className="text-gray-500 mt-2">Browse all available subjects and enroll to start learning.</p>
        </div>

        <div className="relative mb-8 max-w-lg">
          <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition text-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 mx-auto" />
              <p className="mt-3 text-gray-500 text-sm">Loading subjects...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No subjects found</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> subject{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((subject, idx) => {
                const isEnrolled = enrolledIds.includes(subject._id);
                const gradient = colors[idx % colors.length];
                return (
                  <div
                    key={subject._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className={`bg-gradient-to-br ${gradient} p-6 flex items-center justify-between`}>
                      <div className="bg-white/20 p-3 rounded-xl">
                        <BookOpen className="text-white" size={24} />
                      </div>
                      {isEnrolled && (
                        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle size={12} /> Enrolled
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-800">{subject.subjectName}</h3>
                      {subject.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{subject.description}</p>
                      )}
                      <button
                        onClick={() => handleEnroll(subject)}
                        disabled={isEnrolled}
                        className={`w-full mt-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          isEnrolled
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                        }`}
                      >
                        {isEnrolled ? '✓ Enrolled' : 'Enroll'}
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

export default StudentSubjects;