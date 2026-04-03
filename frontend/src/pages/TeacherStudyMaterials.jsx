import React, { useEffect, useState, useCallback } from 'react';
import { Edit2, Trash2, Plus, X, Search } from 'lucide-react';
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
  const API_URL = 'http://localhost:5000';

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
      // Filter materials for the logged-in teacher
      const teacherMaterials = data.studyMaterials.filter(m => {
        const materialTeacherId = typeof m.teacherId === 'object' ? m.teacherId._id : m.teacherId;
        return materialTeacherId === teacherId;
      });
      setMaterials(teacherMaterials);
    } catch (error) {
      console.error('Error fetching study materials:', error);
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
    const title = material.title.toLowerCase();
    const subject = typeof material.subjectId === 'object' 
      ? material.subjectId.subjectName.toLowerCase() 
      : material.subjectId.toLowerCase();
    const grade = typeof material.gradeId === 'object' 
      ? material.gradeId.gradeName.toLowerCase() 
      : material.gradeId.toLowerCase();
    
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Study Materials</h1>
            <p className="text-gray-600 mt-2">Manage study materials for your students</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Create Study Material
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, subject, or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Study Materials Table/List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredMaterials.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">
                {materials.length === 0 
                  ? 'No study materials yet. Create one to get started!' 
                  : 'No materials match your search.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMaterials.map((material) => (
                    <tr key={material._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">{material.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {typeof material.subjectId === 'object' 
                          ? material.subjectId.subjectName 
                          : material.subjectId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {typeof material.gradeId === 'object' 
                          ? material.gradeId.gradeName 
                          : material.gradeId}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {material.materialType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(material)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(material)}
                            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {modalType === 'create' ? 'Create Study Material' : 'Edit Study Material'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Lesson */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lesson</label>
                <textarea
                  name="lesson"
                  value={formData.lesson}
                  onChange={handleInputChange}
                  placeholder="Enter lesson description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  rows="3"
                />
              </div>

              {/* Subject Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
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
                {errors.subjectId && <p className="text-red-500 text-sm mt-1">{errors.subjectId}</p>}
              </div>

              {/* Grade Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                <select
                  name="gradeId"
                  value={formData.gradeId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
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
                {errors.gradeId && <p className="text-red-500 text-sm mt-1">{errors.gradeId}</p>}
              </div>

              {/* Material Type Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material Type</label>
                <select
                  name="materialType"
                  value={formData.materialType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
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
                {errors.materialType && <p className="text-red-500 text-sm mt-1">{errors.materialType}</p>}
              </div>

              {/* File URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">File URL</label>
                <input
                  type="url"
                  name="fileUrl"
                  value={formData.fileUrl}
                  onChange={handleInputChange}
                  placeholder="Enter file URL"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    errors.fileUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fileUrl && <p className="text-red-500 text-sm mt-1">{errors.fileUrl}</p>}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
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
