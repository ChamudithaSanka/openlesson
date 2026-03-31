import React, { useEffect, useState } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'delete'
  const [filterStatus, setFilterStatus] = useState('All');
  const [formData, setFormData] = useState({
    fullName: '',
    schoolName: '',
    district: '',
    phone: '',
    status: 'active',
  });

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000';

  // Fetch all students
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentsRes = await fetch(`${API_URL}/api/students/admin/all`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!studentsRes.ok) throw new Error('Failed to fetch students');

        const studentsData = await studentsRes.json();

        setStudents(studentsData.students || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading student data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Filter students based on status
  const filteredStudents = filterStatus === 'All'
    ? students
    : students.filter(student => student.status === filterStatus.toLowerCase());

  // View student details
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      fullName: student.fullName,
      schoolName: student.schoolName || '',
      district: student.district || '',
      phone: student.phone || '',
      status: student.status,
    });
    setModalType('view');
    setShowModal(true);
  };

  // Edit student
  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      fullName: student.fullName,
      schoolName: student.schoolName || '',
      district: student.district || '',
      phone: student.phone || '',
      status: student.status,
    });
    setModalType('edit');
    setShowModal(true);
  };

  // Update student
  const handleUpdateStudent = async () => {
    if (!formData.fullName) {
      alert('Full Name is required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/students/admin/${selectedStudent._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update student');
      const data = await response.json();

      setStudents(
        students.map((s) =>
          s._id === selectedStudent._id ? data.student : s
        )
      );

      setShowModal(false);
      setFormData({
        fullName: '',
        schoolName: '',
        district: '',
        phone: '',
        status: 'active',
      });
      alert('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Error updating student');
    }
  };



  // Delete student
  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.fullName}? This will permanently remove the student and their associated account.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/students/admin/${student._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete student');

      setStudents(students.filter((s) => s._id !== student._id));
      alert('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-gray-600">Loading students...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Management</h1>
          <p className="text-gray-600">Manage and oversee all students in the system</p>
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <span className="text-gray-600 py-2">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-4 font-semibold text-gray-700">Name</th>
                <th className="p-4 font-semibold text-gray-700">Email</th>
                <th className="p-4 font-semibold text-gray-700">School</th>
                <th className="p-4 font-semibold text-gray-700">District</th>
                <th className="p-4 font-semibold text-gray-700">Phone</th>
                <th className="p-4 font-semibold text-gray-700">Status</th>
                <th className="p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 text-gray-800">{student.fullName}</td>
                    <td className="p-4 text-gray-600">{student.userId?.email || 'N/A'}</td>
                    <td className="p-4 text-gray-600">{student.schoolName || '-'}</td>
                    <td className="p-4 text-gray-600">{student.district || '-'}</td>
                    <td className="p-4 text-gray-600">{student.phone || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {modalType === 'view' ? 'Student Details' : 'Edit Student'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={modalType === 'view'}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      modalType === 'view' ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedStudent?.userId?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    disabled={modalType === 'view'}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      modalType === 'view' ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    disabled={modalType === 'view'}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      modalType === 'view' ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={modalType === 'view'}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      modalType === 'view' ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={modalType === 'view'}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      modalType === 'view' ? 'bg-gray-100' : ''
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdateStudent}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      fullName: '',
                      schoolName: '',
                      district: '',
                      phone: '',
                      gradeId: '',
                      status: 'active',
                    });
                  }}
                  className={`flex-1 px-4 py-2 ${
                    modalType === 'edit'
                      ? 'bg-gray-300 text-gray-800'
                      : 'bg-blue-600 text-white'
                  } rounded-lg transition`}
                >
                  {modalType === 'edit' ? 'Cancel' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default StudentManagement;
