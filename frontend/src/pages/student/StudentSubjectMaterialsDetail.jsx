import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, Filter, Search } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const API = 'http://localhost:5000';

const typeStyles = {
  PDF: 'bg-red-100 text-red-700',
  Video: 'bg-purple-100 text-purple-700',
  Document: 'bg-blue-100 text-blue-700',
  Link: 'bg-emerald-100 text-emerald-700',
  Image: 'bg-amber-100 text-amber-700',
  Other: 'bg-slate-100 text-slate-700',
};

const StudentSubjectMaterialsDetail = () => {
  const { subjectId } = useParams();

  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [subjectName, setSubjectName] = useState('Subject Materials');
  const [isAllowedSubject, setIsAllowedSubject] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

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

        const myGradeId = String(profileJson.student?.gradeId?._id || '');
        const enrolled = enrolledJson.subjects || [];

        const selectedSubject = enrolled.find((s) => String(s._id) === String(subjectId));
        setIsAllowedSubject(Boolean(selectedSubject));
        if (selectedSubject?.subjectName) {
          setSubjectName(selectedSubject.subjectName);
        }

        if (!selectedSubject || !myGradeId) {
          setMaterials([]);
          return;
        }

        const allMaterials = materialsJson.studyMaterials || [];
        const filtered = allMaterials.filter((m) => {
          const materialGradeId = String(m.gradeId?._id || m.gradeId || '');
          const materialSubjectId = String(m.subjectId?._id || m.subjectId || '');
          return materialGradeId === myGradeId && materialSubjectId === String(subjectId);
        });

        setMaterials(filtered);
      } catch (error) {
        console.error('Failed to load subject materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  const materialTypes = ['All', 'PDF', 'Video', 'Document', 'Link', 'Image', 'Other'];

  const visibleMaterials = useMemo(() => {
    return materials.filter((m) => {
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        q.length === 0 ||
        m.title?.toLowerCase().includes(q) ||
        m.lesson?.toLowerCase().includes(q) ||
        m.teacherId?.fullName?.toLowerCase().includes(q);
      const matchType = typeFilter === 'All' || m.materialType === typeFilter;
      return matchSearch && matchType;
    });
  }, [materials, searchTerm, typeFilter]);

  return (
    <StudentLayout title="Study Materials">
      <div className="p-8">
        <div className="mb-6 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{subjectName}</h1>
            <p className="text-gray-500 mt-1 text-sm">Files for your grade and selected subject.</p>
          </div>
          <Link
            to="/student/materials"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
          >
            <ArrowLeft size={14} /> Back to Subjects
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto" />
              <p className="mt-3 text-gray-400 text-sm">Loading materials...</p>
            </div>
          </div>
        ) : !isAllowedSubject ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-600 font-semibold">Subject not available</p>
            <p className="text-gray-400 text-sm mt-1">This subject is not in your enrolled subjects.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-md">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search files by title, lesson, or teacher..."
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {materialTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {visibleMaterials.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <FileText size={46} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-semibold">No files found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Try a different search text or file type filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleMaterials.map((material) => (
                  <div
                    key={material._id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-gray-800">{material.title}</p>
                        {material.lesson && (
                          <p className="text-sm text-gray-500 mt-0.5">Lesson: {material.lesson}</p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${typeStyles[material.materialType] || typeStyles.Other}`}
                      >
                        {material.materialType}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      By {material.teacherId?.fullName || 'Teacher'}
                    </div>

                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                    >
                      <ExternalLink size={14} /> Open File
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentSubjectMaterialsDetail;
