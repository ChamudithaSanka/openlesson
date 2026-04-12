import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, Award } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

const TeacherDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'teacher') {
      window.location.href = '/login';
    }
  }, []);

  const fetchTeacherData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Get teacher's own profile
      const response = await fetch(`${API_URL}/api/teachers/my-profile`, {
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
        setSubjects(data.teacher.subjectsTheyTeach || []);
        setGrades(data.teacher.gradesTheyTeach || []);
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

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
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage your subjects and grades</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Subjects Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-indigo-600" size={28} />
            <h2 className="text-3xl font-bold text-gray-800">My Subjects</h2>
            <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold ml-auto">
              {subjects.length}
            </span>
          </div>

          {subjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg font-medium">No subjects assigned yet</p>
              <p className="text-gray-400 mt-2">You can add subjects from your profile settings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div 
                  key={subject._id} 
                  className="bg-white rounded-lg shadow-sm border-l-4 border-indigo-600 p-6 hover:shadow-md transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{subject.subjectName}</h3>
                    <BookOpen className="text-indigo-600 flex-shrink-0 ml-2" size={24} />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{subject.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Subject</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grades Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-purple-600" size={28} />
            <h2 className="text-3xl font-bold text-gray-800">My Grades</h2>
            <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold ml-auto">
              {grades.length}
            </span>
          </div>

          {grades.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Award className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg font-medium">No grades assigned yet</p>
              <p className="text-gray-400 mt-2">You can add grades from your profile settings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grades.map((grade) => (
                <div 
                  key={grade._id} 
                  className="bg-white rounded-lg shadow-sm border-l-4 border-purple-600 p-6 hover:shadow-md transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{grade.gradeName}</h3>
                    <Award className="text-purple-600 flex-shrink-0 ml-2" size={24} />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{grade.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Grade Level</p>
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
