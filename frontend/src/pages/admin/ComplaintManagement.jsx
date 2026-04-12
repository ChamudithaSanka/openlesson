import React, { useEffect, useState } from 'react';
import { Eye, Edit2, Plus } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'status', 'note'
  const [statusInput, setStatusInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch all complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(`${API_URL}/api/complaints/admin/all`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch complaints');
        const data = await response.json();
        setComplaints(data.complaints || []);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        alert('Error loading complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  // View complaint details
  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setModalType('view');
    setShowModal(true);
  };

  // Update status modal
  const handleStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusInput(complaint.status);
    setModalType('status');
    setShowModal(true);
  };

  // Add note modal
  const handleNoteModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNoteInput(complaint.adminNote || '');
    setModalType('note');
    setShowModal(true);
  };

  // Update status
  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/complaints/admin/${selectedComplaint._id}/status`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: statusInput }),
        }
      );

      if (!response.ok) throw new Error('Failed to update status');
      const data = await response.json();

      // Update the complaint in the list
      setComplaints(
        complaints.map((c) =>
          c._id === selectedComplaint._id ? data.complaint : c
        )
      );

      setShowModal(false);
      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  // Add admin note
  const handleAddNote = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/complaints/admin/${selectedComplaint._id}/note`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adminNote: noteInput }),
        }
      );

      if (!response.ok) throw new Error('Failed to add note');
      const data = await response.json();

      // Update the complaint in the list
      setComplaints(
        complaints.map((c) =>
          c._id === selectedComplaint._id ? data.complaint : c
        )
      );

      setShowModal(false);
      alert('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note');
    }
  };

  // Filter complaints by status
  const filteredComplaints =
    filterStatus === 'All'
      ? complaints
      : complaints.filter((c) => c.status === filterStatus);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center text-gray-500">Loading complaints...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Complaint Management</h1>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Complaints</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{complaints.length}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6">
            <p className="text-red-600 text-sm font-medium">Open</p>
            <p className="text-3xl font-bold text-red-800 mt-2">
              {complaints.filter(c => c.status === 'Open').length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <p className="text-yellow-600 text-sm font-medium">Under Review</p>
            <p className="text-3xl font-bold text-yellow-800 mt-2">
              {complaints.filter(c => c.status === 'Under Review').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <p className="text-green-600 text-sm font-medium">Resolved</p>
            <p className="text-3xl font-bold text-green-800 mt-2">
              {complaints.filter(c => c.status === 'Resolved').length}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex gap-2">
          {['All', 'Open', 'Under Review', 'Resolved'].map((status) => (
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

        {/* Complaints Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No complaints found
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      {complaint.studentId?.fullName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm">{complaint.subject}</td>
                    <td className="px-6 py-4 text-sm">{complaint.category}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          complaint.status
                        )}`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewComplaint(complaint)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleStatusModal(complaint)}
                          className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleNoteModal(complaint)}
                          className="p-2 hover:bg-purple-100 rounded-lg text-purple-600"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              {/* View Complaint Modal */}
              {modalType === 'view' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Complaint Details</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Student</p>
                      <p className="text-lg font-semibold">
                        {selectedComplaint.studentId?.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold">
                        {selectedComplaint.studentId?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Subject</p>
                      <p className="text-lg font-semibold">
                        {selectedComplaint.subject}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-lg">
                        {selectedComplaint.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-semibold">
                        {selectedComplaint.status}
                      </p>
                    </div>
                    {selectedComplaint.adminNote && (
                      <div>
                        <p className="text-sm text-gray-600">Admin Note</p>
                        <p className="text-lg">
                          {selectedComplaint.adminNote}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-6 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Update Status Modal */}
              {modalType === 'status' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Update Status</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">
                      Complaint: {selectedComplaint.subject}
                    </label>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    >
                      <option value="Open">Open</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateStatus}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Add Note Modal */}
              {modalType === 'note' && (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Admin Note</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">
                      Complaint: {selectedComplaint.subject}
                    </label>
                    <textarea
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Add or edit admin note..."
                      className="w-full border border-gray-300 rounded-lg p-2 h-32 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddNote}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ComplaintManagement;
