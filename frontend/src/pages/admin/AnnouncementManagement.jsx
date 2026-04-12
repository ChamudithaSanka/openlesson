import React, { useEffect, useState } from 'react';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'create', 'delete'
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRole: '',
    subjectId: '',
    gradeId: '',
    status: 'Active',
  });
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch all announcements, subjects, and grades
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, subjectsRes, gradesRes] = await Promise.all([
          fetch(`${API_URL}/api/announcements`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_URL}/api/subjects`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_URL}/api/grades`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!announcementsRes.ok) throw new Error('Failed to fetch announcements');
        if (!subjectsRes.ok) throw new Error('Failed to fetch subjects');
        if (!gradesRes.ok) throw new Error('Failed to fetch grades');

        const announcementsData = await announcementsRes.json();
        const subjectsData = await subjectsRes.json();
        const gradesData = await gradesRes.json();

        setAnnouncements(announcementsData.data || []);
        setSubjects(subjectsData.data || []);
        setGrades(gradesData.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading announcements data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter announcements based on selected filters
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesRole = !filterRole || announcement.targetRole.toLowerCase() === filterRole.toLowerCase();
    const matchesStatus = !filterStatus || announcement.status === filterStatus;
    return matchesRole && matchesStatus;
  });

  // View announcement details
  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      targetRole: announcement.targetRole,
      subjectId: announcement.subjectId?._id || '',
      gradeId: announcement.gradeId?._id || '',
      status: announcement.status,
    });
    setModalType('view');
    setShowModal(true);
  };

  // Edit announcement
  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      targetRole: announcement.targetRole,
      subjectId: announcement.subjectId?._id || '',
      gradeId: announcement.gradeId?._id || '',
      status: announcement.status,
    });
    setModalType('edit');
    setShowModal(true);
  };

  // Create new announcement
  const handleCreateAnnouncement = () => {
    setSelectedAnnouncement(null);
    setFormData({
      title: '',
      message: '',
      targetRole: '',
      subjectId: '',
      gradeId: '',
      status: 'Active',
    });
    setModalType('create');
    setShowModal(true);
  };

  // Delete announcement
  const handleDeleteClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setModalType('delete');
    setShowModal(true);
  };

  // Update or create announcement
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!formData.message.trim()) {
      alert('Message is required');
      return;
    }

    if (!formData.targetRole.trim()) {
      alert('Target Role is required');
      return;
    }

    try {
      const isEdit = modalType === 'edit';
      const submitData = {
        ...formData,
        postedBy: userId,
        subjectId: formData.subjectId || null,
        gradeId: formData.gradeId || null,
      };

      const response = await fetch(
        isEdit
          ? `${API_URL}/api/announcements/${selectedAnnouncement._id}`
          : `${API_URL}/api/announcements`,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} announcement`);
      const data = await response.json();

      if (isEdit) {
        setAnnouncements(
          announcements.map((a) =>
            a._id === selectedAnnouncement._id ? data.data : a
          )
        );
        alert('Announcement updated successfully');
      } else {
        setAnnouncements([...announcements, data.data]);
        alert('Announcement created successfully');
      }

      setShowModal(false);
      setFormData({
        title: '',
        message: '',
        targetRole: '',
        subjectId: '',
        gradeId: '',
        status: 'Active',
      });
    } catch (error) {
      console.error('Error:', error);
      alert(`Error ${modalType === 'edit' ? 'updating' : 'creating'} announcement`);
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/api/announcements/${selectedAnnouncement._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete announcement');

      setAnnouncements(announcements.filter((a) => a._id !== selectedAnnouncement._id));
      setShowModal(false);
      alert('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement');
    }
  };

  const getSubjectName = (subject) => {
    if (!subject) return 'N/A';
    // If already populated object
    if (typeof subject === 'object' && subject.subjectName) {
      return subject.subjectName;
    }
    // If just an ID, lookup in array
    const found = subjects.find(s => s._id === subject);
    return found ? found.subjectName : 'N/A';
  };

  const getGradeName = (grade) => {
    if (!grade) return 'N/A';
    // If already populated object
    if (typeof grade === 'object' && grade.gradeName) {
      return grade.gradeName;
    }
    // If just an ID, lookup in array
    const found = grades.find(g => g._id === grade);
    return found ? found.gradeName : 'N/A';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-gray-600">Loading announcements...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Announcement Management</h1>
            <p className="text-gray-600">Create, edit, and manage announcements</p>
          </div>
          <button
            onClick={handleCreateAnnouncement}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Add New Announcement
          </button>
        </div>

        {/* Filter Section */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Target Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="donor">Donor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <span className="text-gray-600 py-2 block mb-6">
          Showing {filteredAnnouncements.length} of {announcements.length} announcements
        </span>

        {/* Announcements Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4 font-semibold text-gray-700">Title</th>
                <th className="p-4 font-semibold text-gray-700">Target Role</th>
                <th className="p-4 font-semibold text-gray-700">Subject</th>
                <th className="p-4 font-semibold text-gray-700">Grade</th>
                <th className="p-4 font-semibold text-gray-700">Status</th>
                <th className="p-4 font-semibold text-gray-700">Created Date</th>
                <th className="p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnnouncements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No announcements found
                  </td>
                </tr>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <tr key={announcement._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 text-gray-800 font-semibold">
                      {announcement.title}
                    </td>
                    <td className="p-4 text-gray-600">
                      {announcement.targetRole}
                    </td>
                    <td className="p-4 text-gray-600">
                      {getSubjectName(announcement.subjectId)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {getGradeName(announcement.gradeId)}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        announcement.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {announcement.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex gap-3">
                      <button
                        onClick={() => handleViewAnnouncement(announcement)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="View"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="text-green-600 hover:text-green-800 transition"
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(announcement)}
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
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* View Modal */}
            {modalType === 'view' && (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Announcement Details</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <p className="text-gray-800">{selectedAnnouncement?.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedAnnouncement?.message}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Role
                      </label>
                      <p className="text-gray-800">{selectedAnnouncement?.targetRole}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedAnnouncement?.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedAnnouncement?.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <p className="text-gray-800">{getSubjectName(selectedAnnouncement?.subjectId)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      <p className="text-gray-800">{getGradeName(selectedAnnouncement?.gradeId)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Date
                    </label>
                    <p className="text-gray-800">
                      {new Date(selectedAnnouncement?.createdAt).toLocaleString()}
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
                    {modalType === 'create' ? 'Create New Announcement' : 'Edit Announcement'}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter announcement title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter announcement message..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Role *
                    </label>
                    <select
                      value={formData.targetRole}
                      onChange={(e) =>
                        setFormData({ ...formData, targetRole: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select target role...</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="donor">Donor</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject (Optional)
                      </label>
                      <select
                        value={formData.subjectId}
                        onChange={(e) =>
                          setFormData({ ...formData, subjectId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select subject...</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.subjectName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade (Optional)
                      </label>
                      <select
                        value={formData.gradeId}
                        onChange={(e) =>
                          setFormData({ ...formData, gradeId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select grade...</option>
                        {grades.map((grade) => (
                          <option key={grade._id} value={grade._id}>
                            {grade.gradeName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
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
                  <h2 className="text-xl font-bold text-red-600">Delete Announcement</h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-gray-800">
                    Are you sure you want to delete the announcement <strong>{selectedAnnouncement?.title}</strong>?
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

export default AnnouncementManagement;
