import React, { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterRating, setFilterRating] = useState('All');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000';

  // Fetch all feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/feedback/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch feedbacks');
        const data = await response.json();
        setFeedbacks(data.feedbacks || []);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        alert('Error loading feedbacks');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [token]);

  // View feedback details
  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  // Delete feedback
  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const response = await fetch(`${API_URL}/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete feedback');

      // Update the feedbacks list
      setFeedbacks(feedbacks.filter((f) => f._id !== feedbackId));
      setDeleteConfirm(null);
      alert('Feedback deleted successfully');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Error deleting feedback');
    }
  };

  // Filter feedbacks by rating
  const filteredFeedbacks =
    filterRating === 'All'
      ? feedbacks
      : feedbacks.filter((f) => f.rating === parseInt(filterRating));

  // Calculate statistics
  const totalFeedbacks = feedbacks.length;
  const averageRating = totalFeedbacks > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1)
    : 0;

  const ratingDistribution = {
    5: feedbacks.filter(f => f.rating === 5).length,
    4: feedbacks.filter(f => f.rating === 4).length,
    3: feedbacks.filter(f => f.rating === 3).length,
    2: feedbacks.filter(f => f.rating === 2).length,
    1: feedbacks.filter(f => f.rating === 1).length,
  };

  // Get rating color
  const getRatingColor = (rating) => {
    switch (rating) {
      case 5:
        return 'bg-green-100 text-green-800';
      case 4:
        return 'bg-blue-100 text-blue-800';
      case 3:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-orange-100 text-orange-800';
      case 1:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get star display
  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="text-center text-gray-500">Loading feedbacks...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Feedback Management</h1>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Feedbacks</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{totalFeedbacks}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <p className="text-blue-600 text-sm font-medium">Average Rating</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-3xl font-bold text-blue-800">{averageRating}</p>
              <span className="text-2xl">{renderStars(Math.round(averageRating))}</span>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-6">
            <p className="text-purple-600 text-sm font-medium">5-Star Feedbacks</p>
            <p className="text-3xl font-bold text-purple-800 mt-2">{ratingDistribution[5]}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterRating('All')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterRating === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Ratings
          </button>
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilterRating(rating.toString())}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterRating === rating.toString()
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {rating} {renderStars(rating)}
            </button>
          ))}
        </div>



        {/* Feedbacks Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Comment
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
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No feedbacks found
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((feedback) => (
                  <tr key={feedback._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-semibold">
                          {feedback.studentId?.fullName || 'Unknown'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {feedback.studentId?.userId?.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRatingColor(feedback.rating)}`}>
                        {feedback.rating} {renderStars(feedback.rating)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="line-clamp-2">{feedback.comment}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewFeedback(feedback)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(feedback._id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View Feedback Modal */}
        {showModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Feedback Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Student</p>
                    <p className="text-lg font-semibold">
                      {selectedFeedback.studentId?.fullName || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedFeedback.studentId?.userId?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRatingColor(selectedFeedback.rating)}`}>
                        {selectedFeedback.rating} out of 5
                      </span>
                      <span className="text-2xl">{renderStars(selectedFeedback.rating)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Comment</p>
                    <p className="text-lg bg-gray-50 p-4 rounded-lg mt-1">
                      {selectedFeedback.comment}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted On</p>
                    <p className="text-lg font-semibold">
                      {new Date(selectedFeedback.createdAt).toLocaleString()}
                    </p>
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-sm w-full p-6">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this feedback? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteFeedback(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
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

export default FeedbackManagement;
