import React, { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'teacher') {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Get teacher's own profile
      const response = await fetch(`http://localhost:5000/api/teachers/my-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teacher data');
      }

      const data = await response.json();
      if (data.success && data.teacher) {
        setTeacher(data.teacher);
        setSubjects(data.teacher.subjectsTheyTeach || []);
        setGrades(data.teacher.gradesTheyTeach || []);
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your subjects and grades</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Subjects Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">My Subjects</h2>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {subjects.length}
            </span>
          </div>

          {subjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">No subjects assigned yet</p>
              <p className="text-gray-400 mt-2">You can add subjects from your profile settings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div key={subject._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-800">{subject.subjectName}</h3>
                  <p className="text-gray-600 mt-2 text-sm">{subject.description}</p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">ID: {subject._id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grades Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-800">My Grades</h2>
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {grades.length}
            </span>
          </div>

          {grades.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">No grades assigned yet</p>
              <p className="text-gray-400 mt-2">You can add grades from your profile settings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grades.map((grade) => (
                <div key={grade._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-800">{grade.gradeName}</h3>
                  <p className="text-gray-600 mt-2 text-sm">{grade.description}</p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">ID: {grade._id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
