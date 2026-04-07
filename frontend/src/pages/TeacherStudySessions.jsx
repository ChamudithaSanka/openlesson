import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, Calendar, Users, Trash2, Edit2 } from 'lucide-react';
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
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading study sessions...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  const canCreateSession = teacherData?.subjectsTheyTeach?.length > 0 && 
                          teacherData?.gradesTheyTeach?.length > 0;

  return (
    <TeacherLayout>
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Study Sessions</h1>
            <p className="text-gray-600 mt-2 text-lg">Schedule and manage study sessions for your students</p>
          </div>
          <button
            onClick={handleCreateClick}
            disabled={!canCreateSession}
            className={`px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 ${
              canCreateSession
                ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            + Create Session
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {!canCreateSession && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded">
            You need to have subjects and grades assigned to create study sessions.
            Please contact your administrator.
          </div>
        )}

        {/* Sessions Grid */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Clock className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg font-medium">
              No study sessions yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="bg-white rounded-lg shadow-sm border-l-4 border-cyan-600 p-6 hover:shadow-md transition-all duration-300 transform hover:scale-105"
              >
                {/* Session Title and Status */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">{session.lesson}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ml-2 flex-shrink-0 ${getStatusBadgeColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>

                {/* Subject and Grade */}
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} className="text-cyan-600" />
                  <span>{session.subjectId?.subjectName || 'Subject'} • {session.gradeId?.gradeName || 'Grade'}</span>
                </div>

                {/* Session Details */}
                <div className="space-y-2 mb-4 pb-4 border-t border-gray-200 pt-4">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <Calendar size={16} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-gray-600">{formatDateTime(session.date, session.startTime)} - {session.endTime}</p>
                    </div>
                  </div>
                  {session.notes && (
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <p><span className="font-medium">Notes:</span> {session.notes}</p>
                    </div>
                  )}
                </div>

                {/* Meeting Link */}
                {session.meetingLink && (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center mb-4 px-3 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 transition border border-green-200"
                  >
                    Join Zoom Meeting
                  </a>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditClick(session)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(session)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition"
                  >
                    <Trash2 size={16} />
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
