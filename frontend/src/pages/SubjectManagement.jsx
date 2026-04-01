import React, { useEffect, useState } from 'react';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'create', 'delete'
  const [formData, setFormData] = useState({
    subjectName: '',
    description: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000';

  // Fetch all subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/subjects`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch subjects');

        const data = await response.json();
        setSubjects(data.data || []);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        alert('Error loading subjects data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject =>
    subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()));

  // View subject details
  const handleViewSubject = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      subjectName: subject.subjectName,
      description: subject.description || '',
    });
    setModalType('view');
    setShowModal(true);
  };

  // Edit subject
  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      subjectName: subject.subjectName,
      description: subject.description || '',
    });
    setModalType('edit');
    setShowModal(true);
  };

  // Create new subject
  const handleCreateSubject = () => {
    setSelectedSubject(null);
    setFormData({
      subjectName: '',
      description: '',
    });
    setModalType('create');
    setShowModal(true);
  };

  // Delete subject
  const handleDeleteClick = (subject) => {
    setSelectedSubject(subject);
    setModalType('delete');
    setShowModal(true);
  };

  // Update or create subject
  const handleSubmit = async () => {
    if (!formData.subjectName.trim()) {
      alert('Subject Name is required');
      return;
    }

    try {
      const isEdit = modalType === 'edit';
      const response = await fetch(
        isEdit
          ? `${API_URL}/api/subjects/${selectedSubject._id}`
          : `${API_URL}/api/subjects`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} subject`);
      const data = await response.json();

      if (isEdit) {
        setSubjects(
          subjects.map((s) =>
            s._id === selectedSubject._id ? data.data : s
          )
        );
        alert('Subject updated successfully');
      } else {
        setSubjects([...subjects, data.data]);
        alert('Subject created successfully');
      }

      setShowModal(false);
      setFormData({
        subjectName: '',
        description: '',
      });
    } catch (error) {
      console.error('Error:', error);
      alert(`Error ${modalType === 'edit' ? 'updating' : 'creating'} subject`);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/api/subjects/${selectedSubject._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete subject');

      setSubjects(subjects.filter((s) => s._id !== selectedSubject._id));
      setShowModal(false);
      alert('Subject deleted successfully');
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Error deleting subject');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-gray-600">Loading subjects...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Subject Management</h1>
            <p className="text-gray-600">Create, edit, and manage subjects</p>
          </div>
          <button
            onClick={handleCreateSubject}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Add New Subject
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search subjects by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-600 py-2 block mt-2">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </span>
        </div>

        {/* Subjects Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4 font-semibold text-gray-700">Subject Name</th>
                <th className="p-4 font-semibold text-gray-700">Description</th>
                <th className="p-4 font-semibold text-gray-700">Created Date</th>
                <th className="p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No subjects found
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 text-gray-800 font-semibold">{subject.subjectName}</td>
                    <td className="p-4 text-gray-600">
                      {subject.description || 'N/A'}
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(subject.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex gap-3">
                      <button
                        onClick={() => handleViewSubject(subject)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="View"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleEditSubject(subject)}
                        className="text-green-600 hover:text-green-800 transition"
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(subject)}
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
                  <h2 className="text-xl font-bold text-gray-800">Subject Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Name
                    </label>
                    <p className="text-gray-800">{selectedSubject?.subjectName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-800">{selectedSubject?.description || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Date
                    </label>
                    <p className="text-gray-800">
                      {new Date(selectedSubject?.createdAt).toLocaleString()}
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
                    {modalType === 'create' ? 'Create New Subject' : 'Edit Subject'}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Name *
                    </label>
                    <input
                      type="text"
                      value={formData.subjectName}
                      onChange={(e) =>
                        setFormData({ ...formData, subjectName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mathematics, English"
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
                      placeholder="Enter subject description..."
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
                  <h2 className="text-xl font-bold text-red-600">Delete Subject</h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-gray-800">
                    Are you sure you want to delete the subject <strong>{selectedSubject?.subjectName}</strong>?
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

export default SubjectManagement;
