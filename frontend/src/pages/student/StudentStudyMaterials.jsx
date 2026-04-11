import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentStudyMaterials = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [gradeId, setGradeId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const [profileRes, enrolledRes, materialsRes] = await Promise.all([
          fetch(`${API}/api/students/my-profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/subject-enrollments/my-subjects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/study-materials`),
        ]);

        const profileJson = profileRes.ok ? await profileRes.json() : { student: null };
        const enrolledJson = enrolledRes.ok ? await enrolledRes.json() : { subjects: [] };
        const materialsJson = materialsRes.ok
          ? await materialsRes.json()
          : { studyMaterials: [] };

        const enrolled = enrolledJson.subjects || [];
        const myGradeId = profileJson.student?.gradeId?._id || '';

        setEnrolledSubjects(enrolled);
        setGradeId(myGradeId);

        const enrolledIds = new Set(enrolled.map((s) => String(s._id)));
        const allMaterials = materialsJson.studyMaterials || [];

        const allowedMaterials = allMaterials.filter((m) => {
          const materialGradeId = String(m.gradeId?._id || m.gradeId || '');
          const materialSubjectId = String(m.subjectId?._id || m.subjectId || '');
          return materialGradeId === myGradeId && enrolledIds.has(materialSubjectId);
        });

        setMaterials(allowedMaterials);

      } catch (error) {
        console.error('Failed to load study materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const subjectCards = useMemo(() => {
    return enrolledSubjects.map((subject) => {
      const count = materials.filter(
        (m) => String(m.subjectId?._id || m.subjectId) === String(subject._id)
      ).length;
      return { ...subject, materialCount: count };
    });
  }, [enrolledSubjects, materials]);

  return (
    <StudentLayout title="Study Materials">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Materials filtered by your grade and enrolled subjects.
          </p>
          {gradeId && (
            <div className="mt-3 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <GraduationCap size={14} /> Grade-specific content enabled
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
              <p className="mt-3 text-gray-400 text-sm">Loading study materials...</p>
            </div>
          </div>
        ) : subjectCards.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-semibold">No enrolled subjects found</p>
            <p className="text-gray-400 text-sm mt-1">Enroll in subjects first to see materials.</p>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">
              Your Subjects
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectCards.map((subject) => (
                <button
                  key={subject._id}
                  onClick={() => navigate(`/student/materials/${subject._id}`)}
                  className="text-left rounded-xl border p-4 transition border-gray-200 bg-white hover:border-indigo-300"
                >
                  <p className="font-semibold text-gray-800">{subject.subjectName}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {subject.description || 'No description available'}
                  </p>
                  <p className="text-xs mt-3 font-medium text-indigo-700">
                    {subject.materialCount} file{subject.materialCount !== 1 ? 's' : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentStudyMaterials;
