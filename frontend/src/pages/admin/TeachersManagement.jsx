import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'create', 'edit', 'approve', 'reject'
  const [filterStatus, setFilterStatus] = useState('All');
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    status: 'Pending',
  });

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000';

  // Fetch all teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/teachers/admin/all`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch teachers');
        const data = await response.json();
        setTeachers(data.teachers || []);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        alert('Error loading teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [token]);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setSubjectsLoading(true);
        const response = await fetch(`${API_URL}/api/subjects`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        setSubjects(data.data || []);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setSubjectsLoading(false);
      }
    };

    fetchSubjects();
  }, [token]);

  // Fetch grades
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setGradesLoading(true);
        const response = await fetch(`${API_URL}/api/grades`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch grades');
        const data = await response.json();
        setGrades(data.data || []);
      } catch (error) {
        console.error('Error fetching grades:', error);
      } finally {
        setGradesLoading(false);
      }
    };

    fetchGrades();
  }, [token]);

  // View teacher details
  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setModalType('view');
    setShowModal(true);
  };

  // Approve teacher
  const handleApproveTeacher = async (teacher) => {
    try {
      const response = await fetch(
        `${API_URL}/api/teachers/admin/${teacher._id}/approve`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to approve teacher');
      const data = await response.json();

      setTeachers(
        teachers.map((t) =>
          t._id === teacher._id ? data.teacher : t
        )
      );

      alert('Teacher approved successfully');
    } catch (error) {
      console.error('Error approving teacher:', error);
      alert('Error approving teacher');
    }
  };

  // Reject teacher
  const handleRejectTeacher = async (teacher) => {
    try {
      const response = await fetch(
        `${API_URL}/api/teachers/admin/${teacher._id}/reject`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to reject teacher');
      const data = await response.json();

      setTeachers(
        teachers.map((t) =>
          t._id === teacher._id ? data.teacher : t
        )
      );

      alert('Teacher rejected');
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      alert('Error rejecting teacher');
    }
  };

  // Create new teacher
  const handleCreateTeacher = async () => {
    if (!formData.fullName) {
      alert('Full Name is required');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('email', formData.email);
      payload.append('password', formData.password);
      payload.append('phone', formData.phone);
      payload.append('status', formData.status);
      payload.append('subjectsTheyTeach', JSON.stringify(selectedSubjects));
      payload.append('gradesTheyTeach', JSON.stringify(selectedGrades));
      
      if (cvFile) {
        payload.append('cv', cvFile);
      }

      const response = await fetch(`${API_URL}/api/teachers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      if (!response.ok) throw new Error('Failed to create teacher');
      const data = await response.json();

      setTeachers([...teachers, data.teacher]);
      setShowModal(false);
      setFormData({ fullName: '', email: '', password: '', phone: '', status: 'Pending' });
      setSelectedSubjects([]);
      setSelectedGrades([]);
      setCvFile(null);
      alert('Teacher created successfully');
    } catch (error) {
      console.error('Error creating teacher:', error);
      alert('Error creating teacher');
    }
  };

  // Update teacher
  const handleUpdateTeacher = async () => {
    try {
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        status: formData.status,
        subjectsTheyTeach: selectedSubjects,
        gradesTheyTeach: selectedGrades,
      };

      const response = await fetch(`${API_URL}/api/teachers/${selectedTeacher._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update teacher');
      const data = await response.json();

      setTeachers(
        teachers.map((t) =>
          t._id === selectedTeacher._id ? data.teacher : t
        )
      );

      setShowModal(false);
      setFormData({ fullName: '', email: '', password: '', phone: '', status: 'Pending' });
      setSelectedSubjects([]);
      setSelectedGrades([]);
      setCvFile(null);
      alert('Teacher updated successfully');
    } catch (error) {
      console.error('Error updating teacher:', error);
      alert('Error updating teacher');
    }
  };

  // Delete teacher
  const handleDeleteTeacher = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.fullName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/teachers/${teacher._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete teacher');

      setTeachers(teachers.filter((t) => t._id !== teacher._id));
      alert('Teacher deleted successfully');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Error deleting teacher');
    }
  };

  // Form input handler
  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Download CV file
  const handleDownloadCV = async (cvUrl) => {
    try {
      const response = await fetch(`http://localhost:5000${cvUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cvUrl.split('/').pop() || 'cv.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Failed to download CV');
    }
  };

  // Filter teachers by verification status
  const filteredTeachers =
    filterStatus === 'All'
      ? teachers
      : filterStatus === 'Approved'
      ? teachers.filter((t) => t.status === 'Approved')
      : filterStatus === 'Pending'
      ? teachers.filter((t) => t.status === 'Pending')
      : teachers.filter((t) => t.status === 'Rejected');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center text-gray-500">Loading teachers...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Teachers Management</h1>
          <button
            onClick={() => {
              setModalType('create');
              setFormData({ fullName: '', email: '', password: '', phone: '', status: 'Pending' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            <Plus size={20} />
            Add Teacher
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Teachers</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{teachers.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <p className="text-yellow-600 text-sm font-medium">Pending Approval</p>
            <p className="text-3xl font-bold text-yellow-800 mt-2">
              {teachers.filter(t => t.status === 'Pending').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <p className="text-green-600 text-sm font-medium">Approved</p>
            <p className="text-3xl font-bold text-green-800 mt-2">
              {teachers.filter(t => t.status === 'Approved').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6">
            <p className="text-red-600 text-sm font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-800 mt-2">
              {teachers.filter(t => t.status === 'Rejected').length}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex gap-2">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Teachers Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Subjects
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Grades
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No teachers found
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{teacher.fullName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm">{teacher.userId?.email || '-'}</td>
                    <td className="px-6 py-4 text-sm">{teacher.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjectsTheyTeach && teacher.subjectsTheyTeach.length > 0 ? (
                          teacher.subjectsTheyTeach.map((subject) => (
                            <span key={subject._id} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {subject.subjectName || subject.name || 'Subject'}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {teacher.gradesTheyTeach && teacher.gradesTheyTeach.length > 0 ? (
                          teacher.gradesTheyTeach.map((grade) => (
                            <span key={grade._id} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {grade.gradeName || grade.name || 'Grade'}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          teacher.status
                        )}`}
                      >
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewTeacher(teacher)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                        >
                          <Eye size={18} />
                        </button>
                        {teacher.status === 'Approved' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setFormData({
                                  fullName: teacher.fullName,
                                  phone: teacher.phone || '',
                                  status: teacher.status,
                                });
                                setSelectedSubjects(
                                  teacher.subjectsTheyTeach?.map((s) => s._id) || []
                                );
                                setSelectedGrades(
                                  teacher.gradesTheyTeach?.map((g) => g._id) || []
                                );
                                setCvFile(null);
                                setModalType('edit');
                                setShowModal(true);
                              }}
                              className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(teacher)}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {teacher.status === 'Rejected' && (
                          <button
                            onClick={() => handleDeleteTeacher(teacher)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        {teacher.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApproveTeacher(teacher)}
                              className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleRejectTeacher(teacher)}
                              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View Modal */}
        {showModal && selectedTeacher && modalType === 'view' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[500px] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Teacher Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-lg font-semibold">
                      {selectedTeacher.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold">
                      {selectedTeacher.userId?.email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-lg font-semibold">
                      {selectedTeacher.phone || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subjects They Teach</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTeacher.subjectsTheyTeach && selectedTeacher.subjectsTheyTeach.length > 0 ? (
                        selectedTeacher.subjectsTheyTeach.map((subject) => (
                          <span key={subject._id} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {subject.subjectName || subject.name || 'Subject'}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No subjects assigned</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Grades They Teach</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTeacher.gradesTheyTeach && selectedTeacher.gradesTheyTeach.length > 0 ? (
                        selectedTeacher.gradesTheyTeach.map((grade) => (
                          <span key={grade._id} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            {grade.gradeName || grade.name || 'Grade'}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No grades assigned</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-semibold">
                      {selectedTeacher.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CV Document</p>
                    {selectedTeacher.cvUrl ? (
                      <button
                        onClick={() => handleDownloadCV(selectedTeacher.cvUrl)}
                        className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                      >
                        Download CV
                      </button>
                    ) : (
                      <p className="text-gray-500 text-sm">No CV uploaded</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-6 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showModal && modalType === 'create' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col">
              <div className="p-6 overflow-y-auto flex-1">
                <h2 className="text-2xl font-bold mb-4">Add New Teacher</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder="Teacher's full name"
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="Email address"
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder="Password"
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="Phone number"
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    >
                    
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Subjects They Teach</label>
                    <div className="rounded-md border border-gray-300 bg-gray-50 p-3 max-h-40 overflow-y-auto">
                      {subjectsLoading ? (
                        <p className="text-xs text-gray-600">Loading subjects...</p>
                      ) : subjects.length === 0 ? (
                        <p className="text-xs text-gray-600">No subjects available</p>
                      ) : (
                        <div className="space-y-2">
                          {subjects.map((subject) => (
                            <label key={subject._id} className="flex items-center text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedSubjects.includes(subject._id)}
                                onChange={() =>
                                  setSelectedSubjects((prev) =>
                                    prev.includes(subject._id)
                                      ? prev.filter((id) => id !== subject._id)
                                      : [...prev, subject._id]
                                  )
                                }
                                className="mr-2 h-4 w-4 rounded border-gray-300"
                              />
                              <span>{subject.subjectName || subject.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Grades They Teach</label>
                    <div className="rounded-md border border-gray-300 bg-gray-50 p-3 max-h-40 overflow-y-auto">
                      {gradesLoading ? (
                        <p className="text-xs text-gray-600">Loading grades...</p>
                      ) : grades.length === 0 ? (
                        <p className="text-xs text-gray-600">No grades available</p>
                      ) : (
                        <div className="space-y-2">
                          {grades.map((grade) => (
                            <label key={grade._id} className="flex items-center text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedGrades.includes(grade._id)}
                                onChange={() =>
                                  setSelectedGrades((prev) =>
                                    prev.includes(grade._id)
                                      ? prev.filter((id) => id !== grade._id)
                                      : [...prev, grade._id]
                                  )
                                }
                                className="mr-2 h-4 w-4 rounded border-gray-300"
                              />
                              <span>{grade.gradeName || grade.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">CV File (PDF/DOC/DOCX)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="block w-full border border-gray-300 rounded-lg p-2 file:mr-3 file:rounded file:border-0 file:bg-yellow-300 file:px-3 file:py-1 file:font-semibold"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 p-6 border-t bg-gray-50">
                <button
                  onClick={handleCreateTeacher}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ fullName: '', email: '', password: '', phone: '', status: 'Pending' });
                    setSelectedSubjects([]);
                    setSelectedGrades([]);
                    setCvFile(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showModal && selectedTeacher && modalType === 'edit' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 mt-14">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] flex flex-col">
              <div className="p-6 overflow-y-auto flex-1">
                <h2 className="text-2xl font-bold mb-4">Edit Teacher</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder="Teacher's full name"
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="Phone number"
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Subjects They Teach</label>
                    <div className="rounded-md border border-gray-300 bg-gray-50 p-3 max-h-40 overflow-y-auto">
                      {subjectsLoading ? (
                        <p className="text-xs text-gray-600">Loading subjects...</p>
                      ) : subjects.length === 0 ? (
                        <p className="text-xs text-gray-600">No subjects available</p>
                      ) : (
                        <div className="space-y-2">
                          {subjects.map((subject) => (
                            <label key={subject._id} className="flex items-center text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedSubjects.includes(subject._id)}
                                onChange={() =>
                                  setSelectedSubjects((prev) =>
                                    prev.includes(subject._id)
                                      ? prev.filter((id) => id !== subject._id)
                                      : [...prev, subject._id]
                                  )
                                }
                                className="mr-2 h-4 w-4 rounded border-gray-300"
                              />
                              <span>{subject.subjectName || subject.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Grades They Teach</label>
                    <div className="rounded-md border border-gray-300 bg-gray-50 p-3 max-h-40 overflow-y-auto">
                      {gradesLoading ? (
                        <p className="text-xs text-gray-600">Loading grades...</p>
                      ) : grades.length === 0 ? (
                        <p className="text-xs text-gray-600">No grades available</p>
                      ) : (
                        <div className="space-y-2">
                          {grades.map((grade) => (
                            <label key={grade._id} className="flex items-center text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedGrades.includes(grade._id)}
                                onChange={() =>
                                  setSelectedGrades((prev) =>
                                    prev.includes(grade._id)
                                      ? prev.filter((id) => id !== grade._id)
                                      : [...prev, grade._id]
                                  )
                                }
                                className="mr-2 h-4 w-4 rounded border-gray-300"
                              />
                              <span>{grade.gradeName || grade.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 p-6 border-t bg-gray-50">
                <button
                  onClick={handleUpdateTeacher}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ fullName: '', phone: '', status: 'Pending' });
                    setSelectedSubjects([]);
                    setSelectedGrades([]);
                    setCvFile(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeachersManagement;
