import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, BookOpen, Clock, MessageSquare, Trash2 } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const StudentEnrolledTeachers = () => {
  const [enrolledTeachers, setEnrolledTeachers] = useState([]);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    // Fetch enrolled teachers from backend
    const fetchEnrolled = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/enrollments/my-teachers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEnrolledTeachers(data.teachers || []);
          localStorage.setItem('enrolledTeachers', JSON.stringify(data.teachers || []));
        }
      } catch {}
    };
    fetchEnrolled();
  }, []);

  const handleUnenroll = async (teacherId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/enrollments/${teacherId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = enrolledTeachers.filter((t) => t._id !== teacherId);
        setEnrolledTeachers(updated);
        localStorage.setItem('enrolledTeachers', JSON.stringify(updated));
        showToast('Unenrolled successfully.');
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to unenroll.');
      }
    } catch {
      showToast('Failed to unenroll.');
    }
  };

  return (
    <StudentLayout title="Enrolled Teachers">
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Enrolled Teachers</h1>
          <p className="text-gray-500 mt-2">
            Teachers you've enrolled in — access their sessions, quizzes, and give feedback.
          </p>
        </div>

        {enrolledTeachers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <UserCheck size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-lg">No enrolled teachers yet</p>
            <p className="text-gray-400 text-sm mt-1">Go to Explore Teachers to enroll</p>
            <Link
              to="/student/teachers"
              className="inline-block mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition"
            >
              Explore Teachers
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-gray-700">{enrolledTeachers.length}</span> teacher{enrolledTeachers.length !== 1 ? 's' : ''} enrolled
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledTeachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-br from-indigo-500 via-blue-400 to-cyan-400 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                      {teacher.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">{teacher.fullName}</h3>
                      {teacher.qualification && (
                        <p className="text-green-100 text-xs">{teacher.qualification}</p>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    {/* Subjects */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Subjects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.subjectsTheyTeach?.length > 0 ? (
                          teacher.subjectsTheyTeach.map((s) => (
                            <span key={s._id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              {s.subjectName}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-col gap-2">
                      <Link
                        to="/student/sessions"
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold transition"
                      >
                        <Clock size={15} /> View Sessions
                      </Link>
                      <Link
                        to="/student/feedback"
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition"
                      >
                        <MessageSquare size={15} /> Give Feedback
                      </Link>
                      <button
                        onClick={() => handleUnenroll(teacher._id)}
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
                      >
                        <Trash2 size={15} /> Unenroll
                      </button>
                    </div>
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

export default StudentEnrolledTeachers;