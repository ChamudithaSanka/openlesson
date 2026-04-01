import React, { useEffect, useState } from 'react';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const GradeManagement = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'create', 'delete'
  const [formData, setFormData] = useState({
    gradeName: '',
    description: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000';

  // Fetch all grades
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch(`${API_URL}/api/grades`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch grades');

        const data = await response.json();
        setGrades(data.data || []);
      } catch (error) {
        console.error('Error fetching grades:', error);
        alert('Error loading grades data');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // Filter grades based on search term
  const filteredGrades = grades.filter(grade =>
    grade.gradeName.toLowerCase().includes(searchTerm.toLowerCase()));

  // View grade details
  const handleViewGrade = (grade) => {
    setSelectedGrade(grade);
    setFormData({
      gradeName: grade.gradeName,
      description: grade.description || '',
    });
    setModalType('view');
    setShowModal(true);
  };

  // Edit grade
  const handleEditGrade = (grade) => {
    setSelectedGrade(grade);
    setFormData({
      gradeName: grade.gradeName,
      description: grade.description || '',
    });
    setModalType('edit');
    setShowModal(true);
  };

  // Create new grade
  const handleCreateGrade = () => {
    setSelectedGrade(null);
    setFormData({
      gradeName: '',
      description: '',
    });
    setModalType('create');
    setShowModal(true);
  };

  // Delete grade
  const handleDeleteClick = (grade) => {
    setSelectedGrade(grade);
    setModalType('delete');
    setShowModal(true);
  };

  // Update or create grade
  const handleSubmit = async () => {
    if (!formData.gradeName.trim()) {
      alert('Grade Name is required');
      return;
    }

    try {
      const isEdit = modalType === 'edit';
      const response = await fetch(
        isEdit
          ? `${API_URL}/api/grades/${selectedGrade._id}`
          : `${API_URL}/api/grades`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} grade`);
      const data = await response.json();

      if (isEdit) {
        setGrades(
          grades.map((g) =>
            g._id === selectedGrade._id ? data.data : g
          )
        );
        alert('Grade updated successfully');
      } else {
        setGrades([...grades, data.data]);
        alert('Grade created successfully');
      }

      setShowModal(false);
      setFormData({
        gradeName: '',
        description: '',
      });
    } catch (error) {
      console.error('Error:', error);
      alert(`Error ${modalType === 'edit' ? 'updating' : 'creating'} grade`);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/api/grades/${selectedGrade._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete grade');

      setGrades(grades.filter((g) => g._id !== selectedGrade._id));
      setShowModal(false);
      alert('Grade deleted successfully');
    } catch (error) {
      console.error('Error deleting grade:', error);
      alert('Error deleting grade');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-gray-600">Loading grades...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Grade Management</h1>
            <p className="text-gray-600">Create, edit, and manage grade levels</p>
          </div>
          <button
            onClick={handleCreateGrade}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Add New Grade
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search grades by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-600 py-2 block mt-2">
            Showing {filteredGrades.length} of {grades.length} grades
          </span>
        </div>

        {/* Grades Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4 font-semibold text-gray-700">Grade Name</th>
                <th className="p-4 font-semibold text-gray-700">Description</th>
                <th className="p-4 font-semibold text-gray-700">Created Date</th>
                <th className="p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No grades found
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => (
                  <tr key={grade._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 text-gray-800 font-semibold">{grade.gradeName}</td>
                    <td className="p-4 text-gray-600">
                      {grade.description || 'N/A'}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(grade.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex gap-3">
                      <button
                        onClick={() => handleViewGrade(grade)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="View"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleEditGrade(grade)}
                        className="text-green-600 hover:text-green-800 transition"
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(grade)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            {/* View Modal */}
            {modalType === 'view' && (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Grade Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade Name
                    </label>
                    <p className="text-gray-800">{selectedGrade?.gradeName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-800">{selectedGrade?.description || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Date
                    </label>
                    <p className="text-gray-800">
                      {new Date(selectedGrade?.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Edit/Create Modal */}
            {(modalType === 'edit' || modalType === 'create') && (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    {modalType === 'create' ? 'Create New Grade' : 'Edit Grade'}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade Name *
                    </label>
                    <input
                      type="text"
                      value={formData.gradeName}
                      onChange={(e) =>
                        setFormData({ ...formData, gradeName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Grade 1, Grade 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter grade description..."
                    />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {modalType === 'create' ? 'Create' : 'Update'}
                  </button>
                </div>
              </div>
            )}

            {/* Delete Modal */}
            {modalType === 'delete' && (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-red-600">Delete Grade</h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-gray-800">
                    Are you sure you want to delete the grade <strong>{selectedGrade?.gradeName}</strong>?
                  </p>
                  <p className="text-gray-600 text-sm">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default GradeManagement;
