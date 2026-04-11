import React, { useEffect, useState, useCallback } from 'react';
import { Edit2, Trash2, Plus, X, Search, FileText, Video, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

const TeacherStudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    lesson: '',
    subjectId: '',
    gradeId: '',
    materialType: 'PDF',
    fileUrl: '',
  });
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchStudyMaterials = useCallback(async (teacherId) => {
    try {
      const response = await fetch(`${API_URL}/api/study-materials`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch study materials');

      const data = await response.json();
      const allMaterials = data.studyMaterials || data.data || [];
      
      // Filter materials for the logged-in teacher with null safety checks
      const teacherMaterials = allMaterials.filter(m => {
        if (!m.teacherId) return false;
        const materialTeacherId = typeof m.teacherId === 'object' ? m.teacherId._id : m.teacherId;
        return materialTeacherId === teacherId;
      });
      console.log(`Fetched ${allMaterials.length} total materials, ${teacherMaterials.length} for teacher ${teacherId}`);
      setMaterials(teacherMaterials);
    } catch (error) {
      console.error('Error fetching study materials:', error);
      setMaterials([]);
    }
  }, [API_URL]);

  const fetchTeacherData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/teachers/my-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch teacher data');

      const data = await response.json();
      if (data.success && data.teacher) {
        setTeacher(data.teacher);
        setSubjects(data.teacher.subjectsTheyTeach || []);
        setGrades(data.teacher.gradesTheyTeach || []);
        await fetchStudyMaterials(data.teacher._id);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, fetchStudyMaterials]);

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'teacher') {
      window.location.href = '/login';
    }
    fetchTeacherData();
  }, [fetchTeacherData]);

  const handleCreateClick = () => {
    setModalType('create');
    setSelectedMaterial(null);
    setFormData({
      title: '',
      lesson: '',
      subjectId: '',
      gradeId: '',
      materialType: 'PDF',
      fileUrl: '',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEditClick = (material) => {
    setModalType('edit');
    setSelectedMaterial(material);
    setFormData({
      title: material.title,
      lesson: material.lesson || '',
      subjectId: typeof material.subjectId === 'object' ? material.subjectId._id : material.subjectId,
      gradeId: typeof material.gradeId === 'object' ? material.gradeId._id : material.gradeId,
      materialType: material.materialType,
      fileUrl: material.fileUrl,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.subjectId) newErrors.subjectId = 'Subject is required';
    if (!formData.gradeId) newErrors.gradeId = 'Grade is required';
    if (!formData.materialType) newErrors.materialType = 'Material Type is required';
    if (!formData.fileUrl.trim()) newErrors.fileUrl = 'File URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        teacherId: teacher._id,
      };

      const isEdit = modalType === 'edit';
      const response = await fetch(
        isEdit
          ? `${API_URL}/api/study-materials/${selectedMaterial._id}`
          : `${API_URL}/api/study-materials`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} study material`);

      alert(`Study material ${isEdit ? 'updated' : 'created'} successfully`);
      
      // Small delay to ensure backend has fully processed the material
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch materials to ensure proper data with populated references
      await fetchStudyMaterials(teacher._id);

      setShowModal(false);
      setFormData({
        title: '',
        lesson: '',
        subjectId: '',
        gradeId: '',
        materialType: 'PDF',
        fileUrl: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error:', error);
      alert(`Error ${modalType === 'edit' ? 'updating' : 'creating'} study material`);
    }
  };

  const handleDeleteClick = async (material) => {
    if (window.confirm('Are you sure you want to delete this study material?')) {
      try {
        const response = await fetch(`${API_URL}/api/study-materials/${material._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to delete study material');

        setMaterials(materials.filter(m => m._id !== material._id));
        alert('Study material deleted successfully');
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting study material');
      }
    }
  };

  // Filter materials based on search term
  const filteredMaterials = materials.filter(material => {
    const searchLower = searchTerm.toLowerCase();
    const title = material.title ? material.title.toLowerCase() : '';
    const subject = typeof material.subjectId === 'object' && material.subjectId?.subjectName
      ? material.subjectId.subjectName.toLowerCase() 
      : '';
    const grade = typeof material.gradeId === 'object' && material.gradeId?.gradeName
      ? material.gradeId.gradeName.toLowerCase() 
      : '';
    
    return (
      title.includes(searchLower) || 
      subject.includes(searchLower) || 
      grade.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <TeacherLayout>
        <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading study materials...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Study Materials</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage study materials for your students</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105"
          >
            <Plus size={20} />
            Create Study Material
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, subject, or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Study Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg font-medium">
              {materials.length === 0 
                ? 'No study materials yet. Create one to get started!' 
                : 'No materials match your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div 
                key={material._id} 
                className="bg-white rounded-lg shadow-sm border-l-4 border-purple-600 p-6 hover:shadow-md transition-all duration-300 transform hover:scale-105"
              >
                {/* Header with Type Badge and Icon */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{material.title}</h3>
                  </div>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold ml-2 flex-shrink-0">
                    {material.materialType}
                  </span>
                </div>

                {/* Subject and Grade Info */}
                <div className="mb-3 space-y-2">
                  <div className="text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-700">Subject: </span>
                      {material.subjectId && typeof material.subjectId === 'object' 
                        ? material.subjectId.subjectName 
                        : material.subjectId || 'N/A'}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-700">Grade: </span>
                      {material.gradeId && typeof material.gradeId === 'object' 
                        ? material.gradeId.gradeName 
                        : material.gradeId || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Description/Lesson */}
                {material.lesson && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{material.lesson}</p>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(material)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(material)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                {modalType === 'create' ? 'Create Study Material' : 'Edit Study Material'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Lesson */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Lesson</label>
                <textarea
                  name="lesson"
                  value={formData.lesson}
                  onChange={handleInputChange}
                  placeholder="Enter lesson description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                  rows="2"
                />
              </div>

              {/* Subject Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    errors.subjectId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
                {errors.subjectId && <p className="text-red-500 text-xs mt-1">{errors.subjectId}</p>}
              </div>

              {/* Grade Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Grade</label>
                <select
                  name="gradeId"
                  value={formData.gradeId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    errors.gradeId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a grade</option>
                  {grades.map(grade => (
                    <option key={grade._id} value={grade._id}>
                      {grade.gradeName}
                    </option>
                  ))}
                </select>
                {errors.gradeId && <p className="text-red-500 text-xs mt-1">{errors.gradeId}</p>}
              </div>

              {/* Material Type Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Material Type</label>
                <select
                  name="materialType"
                  value={formData.materialType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    errors.materialType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="PDF">PDF</option>
                  <option value="Video">Video</option>
                  <option value="Document">Document</option>
                  <option value="Link">Link</option>
                  <option value="Image">Image</option>
                  <option value="Other">Other</option>
                </select>
                {errors.materialType && <p className="text-red-500 text-xs mt-1">{errors.materialType}</p>}
              </div>

              {/* File URL */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">File URL</label>
                <input
                  type="url"
                  name="fileUrl"
                  value={formData.fileUrl}
                  onChange={handleInputChange}
                  placeholder="Enter file URL"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    errors.fileUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fileUrl && <p className="text-red-500 text-xs mt-1">{errors.fileUrl}</p>}
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition"
              >
                {modalType === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
};

export default TeacherStudyMaterials;
