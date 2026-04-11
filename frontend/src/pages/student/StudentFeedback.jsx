import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Star, CheckCircle, AlertCircle } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const API = 'http://localhost:5000';

const StudentFeedback = () => {
  const [enrolledTeachers, setEnrolledTeachers] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [form, setForm] = useState({ teacherId: '', rating: 0, comment: '' });
  const [loading, setLoading] = useState(false);
  const [fetchingFeedbacks, setFetchingFeedbacks] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const token = localStorage.getItem('token');

  const fetchMyFeedbacks = useCallback(async () => {
    try {
      setFetchingFeedbacks(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const studentId = user?.profile?._id;
      if (!studentId) return;
      const res = await fetch(`${API}/api/feedback/student/${studentId}`);
      const data = await res.json();
      setMyFeedbacks(data.feedbacks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingFeedbacks(false);
    }
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('enrolledTeachers') || '[]');
    setEnrolledTeachers(saved);
    fetchMyFeedbacks();
  }, [fetchMyFeedbacks]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.teacherId) return setError('Please select a teacher.');
    if (form.rating === 0) return setError('Please select a rating.');
    if (!form.comment.trim()) return setError('Please write a comment.');

    try {
      setLoading(true);
      const selectedTeacher = enrolledTeachers.find((t) => t._id === form.teacherId);
      const res = await fetch(`${API}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacherId: form.teacherId,
          teacherName: selectedTeacher?.fullName || 'Unknown',
          rating: form.rating,
          comment: form.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit feedback');
      setSuccess('Feedback submitted successfully!');
      setForm({ teacherId: '', rating: 0, comment: '' });
      fetchMyFeedbacks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedTeacher = enrolledTeachers.find((t) => t._id === form.teacherId);

  return (
    <StudentLayout title="Feedback">
      <div className="p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Teacher Feedback</h1>
          <p className="text-gray-500 mt-2">Share your experience with teachers you've enrolled in.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <MessageSquare size={20} className="text-purple-600" /> Give Feedback
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Teacher Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Teacher *</label>
                {enrolledTeachers.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    You need to enroll in a teacher first before giving feedback.
                  </div>
                ) : (
                  <select
                    value={form.teacherId}
                    onChange={(e) => setForm((p) => ({ ...p, teacherId: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition text-sm"
                  >
                    <option value="">-- Select a teacher --</option>
                    {enrolledTeachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setForm((p) => ({ ...p, rating: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          star <= (hoverRating || form.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {form.rating > 0 && (
                    <span className="ml-2 text-sm font-medium text-gray-600 self-center">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comment *</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
                  placeholder="Share your experience with this teacher..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition text-sm resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm">
                  <CheckCircle size={16} /> {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || enrolledTeachers.length === 0}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>

          {/* Previous Feedbacks */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">My Feedback History</h2>
            {fetchingFeedbacks ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              </div>
            ) : myFeedbacks.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                <MessageSquare size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No feedback submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myFeedbacks.map((fb) => (
                  <div key={fb._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {fb.teacherName || fb.teacherId?.fullName || 'Teacher'}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(fb.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{fb.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentFeedback;