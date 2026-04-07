import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Library, Trash2 } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const colors = [
  'from-indigo-500 to-indigo-700',
  'from-cyan-500 to-cyan-700',
  'from-teal-500 to-teal-700',
  'from-blue-500 to-blue-700',
  'from-violet-500 to-violet-700',
  'from-sky-500 to-sky-700',
];

const StudentEnrolledSubjects = () => {
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('enrolledSubjects') || '[]');
    setEnrolledSubjects(saved);
  }, []);

  const handleUnenroll = (subjectId) => {
    const updated = enrolledSubjects.filter((s) => s._id !== subjectId);
    setEnrolledSubjects(updated);
    localStorage.setItem('enrolledSubjects', JSON.stringify(updated));
    showToast('Unenrolled from subject.');
  };

  return (
    <StudentLayout title="Enrolled Subjects">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Enrolled Subjects</h1>
          <p className="text-gray-500 mt-2">Subjects you're currently enrolled in.</p>
        </div>

        {enrolledSubjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <Library size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-lg">No subjects enrolled yet</p>
            <p className="text-gray-400 text-sm mt-1">Explore subjects or enroll through a teacher</p>
            <Link
              to="/student/subjects"
              className="inline-block mt-5 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-teal-700 transition"
            >
              Explore Subjects
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-gray-700">{enrolledSubjects.length}</span> subject{enrolledSubjects.length !== 1 ? 's' : ''} enrolled
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledSubjects.map((subject, idx) => (
                <div
                  key={subject._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`bg-gradient-to-br ${colors[idx % colors.length]} p-6`}>
                    <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center">
                      <Library className="text-white" size={22} />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800">{subject.subjectName}</h3>
                    {subject.description && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{subject.description}</p>
                    )}
                    <button
                      onClick={() => handleUnenroll(subject._id)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} /> Unenroll
                    </button>
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

export default StudentEnrolledSubjects;