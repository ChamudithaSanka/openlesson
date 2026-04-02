import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TeacherLayout from '../components/TeacherLayout';
import SessionModal from '../components/SessionModal';

const TeacherStudySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch teacher profile and sessions on mount
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'teacher') {
      window.location.href = '/login';
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const fetchTeacherAndSessions = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch teacher profile
        const teacherRes = await axios.get('http://localhost:5000/api/teachers/my-profile', config);
        setTeacherData(teacherRes.data.teacher || teacherRes.data.data || teacherRes.data);

        // Fetch all sessions for this teacher
        const sessionsRes = await axios.get(
          'http://localhost:5000/api/study-sessions',
          config
        );
        setSessions(sessionsRes.data.data || sessionsRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          err.response?.data?.message || 'Failed to load data. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherAndSessions();
  }, [token]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCreateClick = () => {
    setSelectedSession(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleSessionSave = async () => {
    // Refresh sessions list
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const sessionsRes = await axios.get(
        'http://localhost:5000/api/study-sessions',
        config
      );
      setSessions(sessionsRes.data.data || sessionsRes.data || []);
      setSuccessMessage(
        selectedSession
          ? 'Session updated successfully!'
          : 'Session created successfully!'
      );
    } catch (err) {
      console.error('Error refreshing sessions:', err);
      setError('Failed to refresh sessions');
    }
  };

  const handleDeleteClick = (session) => {
    setDeleteConfirm(session);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(
        `http://localhost:5000/api/study-sessions/${deleteConfirm._id}`,
        config
      );

      setSessions((prev) =>
        prev.filter((session) => session._id !== deleteConfirm._id)
      );
      setSuccessMessage('Session deleted successfully!');
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(
        err.response?.data?.message || 'Failed to delete session. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Ongoing':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${dateStr} at ${time}`;
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <h1 className="text-3xl font-bold text-gray-800">Study Sessions</h1>
          <div className="mt-8 flex justify-center items-center h-64">
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  const canCreateSession = teacherData?.subjectsTheyTeach?.length > 0 && 
                          teacherData?.gradesTheyTeach?.length > 0;

  return (
    <TeacherLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Study Sessions</h1>
            <p className="text-gray-600 mt-2">
              Schedule and manage study sessions for your students
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            disabled={!canCreateSession}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              canCreateSession
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            + Create Session
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {!canCreateSession && (
          <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
            You need to have subjects and grades assigned to create study sessions.
            Please contact your administrator.
          </div>
        )}

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">
              No study sessions yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition"
              >
                {/* Session Header */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-800 break-words">
                    {session.lesson}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {session.subjectId?.subjectName || 'Subject'} •{' '}
                    {session.gradeId?.gradeName || 'Grade'}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                      session.status
                    )}`}
                  >
                    {session.status}
                  </span>
                </div>

                {/* Session Details */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>Date & Time:</strong> {formatDateTime(session.date, session.startTime)} -{' '}
                    {session.endTime}
                  </p>
                  {session.notes && (
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {session.notes}
                    </p>
                  )}
                  {session.meetingId && (
                    <p className="text-sm text-gray-700">
                      <strong>Meeting ID:</strong> {session.meetingId}
                    </p>
                  )}
                </div>

                {/* Meeting Link */}
                {session.meetingLink && (
                  <div className="mb-4">
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center px-3 py-2 bg-green-100 text-green-700 text-sm font-medium rounded hover:bg-green-200 transition"
                    >
                      Join Zoom Meeting
                    </a>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEditClick(session)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded hover:bg-blue-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(session)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Session Modal */}
        <SessionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleSessionSave}
          session={selectedSession}
          teacherData={teacherData}
        />

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Delete Study Session?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the session "{deleteConfirm.lesson}"?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:bg-red-400"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherStudySessions;
