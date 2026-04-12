import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SessionModal = ({ isOpen, onClose, onSave, session, teacherData }) => {
  const [formData, setFormData] = useState({
    lesson: '',
    subjectId: '',
    gradeId: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  useEffect(() => {
    if (session) {
      // Edit mode
      setFormData({
        lesson: session.lesson || '',
        subjectId: session.subjectId?._id || session.subjectId || '',
        gradeId: session.gradeId?._id || session.gradeId || '',
        date: session.date?.split('T')[0] || '',
        startTime: session.startTime || '',
        endTime: session.endTime || '',
        notes: session.notes || '',
      });
    } else {
      // Create mode
      setFormData({
        lesson: '',
        subjectId: '',
        gradeId: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
    }
    setErrors({});
    setSubmitError('');
    setHasTriedSubmit(false);
  }, [session, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.lesson?.trim()) {
      newErrors.lesson = 'Lesson title is required';
    }
    if (!formData.subjectId) {
      newErrors.subjectId = 'Subject is required';
    }
    if (!formData.gradeId) {
      newErrors.gradeId = 'Grade is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    if (formData.startTime && formData.endTime) {
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);
      const startTotalMin = startHour * 60 + startMin;
      const endTotalMin = endHour * 60 + endMin;
      const durationMin = endTotalMin - startTotalMin;

      if (durationMin <= 0) {
        newErrors.endTime = 'End time must be after start time';
      } else if (durationMin < 15) {
        newErrors.endTime = 'Session must be at least 15 minutes';
      } else if (durationMin > 1440) {
        newErrors.endTime = 'Session cannot exceed 24 hours';
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Only clear error for this field if user has tried to submit
    if (hasTriedSubmit && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasTriedSubmit(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';
      if (session) {
        // Update existing session
        await axios.put(
          `${API_URL}/study-sessions/${session._id}`,
          formData,
          config
        );
      } else {
        // Create new session
        await axios.post(
          `${API_URL}/study-sessions`,
          formData,
          config
        );
      }

      onSave();
      onClose();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to save session. Please try again.';
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get available subjects and grades from teacher data
  const availableSubjects = teacherData?.subjectsTheyTeach || [];
  const availableGrades = teacherData?.gradesTheyTeach || [];

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-3 text-gray-800">
          {session ? 'Edit Study Session' : 'Create Study Session'}
        </h2>

        {submitError && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-xs">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Lesson Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Lesson Title *
            </label>
            <input
              type="text"
              name="lesson"
              value={formData.lesson}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm ${
                hasTriedSubmit && errors.lesson ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Algebra Basics"
            />
            {hasTriedSubmit && errors.lesson && (
              <p className="text-red-500 text-xs mt-1">{errors.lesson}</p>
            )}
          </div>

          {/* Subject Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm ${
                hasTriedSubmit && errors.subjectId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a subject</option>
              {availableSubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
            {hasTriedSubmit && errors.subjectId && (
              <p className="text-red-500 text-xs mt-1">{errors.subjectId}</p>
            )}
            {hasTriedSubmit && availableSubjects.length === 0 && !errors.subjectId && (
              <p className="text-orange-600 text-xs mt-1">
                No subjects assigned. Contact administrator.
              </p>
            )}
          </div>

          {/* Grade Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Grade *
            </label>
            <select
              name="gradeId"
              value={formData.gradeId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm ${
                hasTriedSubmit && errors.gradeId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a grade</option>
              {availableGrades.map((grade) => (
                <option key={grade._id} value={grade._id}>
                  {grade.gradeName}
                </option>
              ))}
            </select>
            {hasTriedSubmit && errors.gradeId && (
              <p className="text-red-500 text-xs mt-1">{errors.gradeId}</p>
            )}
            {hasTriedSubmit && availableGrades.length === 0 && !errors.gradeId && (
              <p className="text-orange-600 text-xs mt-1">
                No grades assigned. Contact administrator.
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={today}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm ${
                hasTriedSubmit && errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {hasTriedSubmit && errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm ${
                hasTriedSubmit && errors.startTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {hasTriedSubmit && errors.startTime && (
              <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm ${
                hasTriedSubmit && errors.endTime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {hasTriedSubmit && errors.endTime && (
              <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              placeholder="Add any additional notes..."
              rows="2"
            />
          </div>

          {/* Meeting Info (Read-only in edit mode) */}
          {session && session.meetingLink && (
            <div className="bg-blue-50 p-2 rounded-md text-xs">
              <p className="text-gray-600 font-medium mb-1">Meeting Information:</p>
              <p className="text-gray-700 break-all">
                <strong>Meeting ID:</strong> {session.meetingId}
              </p>
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline mt-1 block"
              >
                Open Meeting Link
              </a>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-5 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition text-sm font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition disabled:bg-cyan-500 text-sm font-medium"
              disabled={loading}
            >
              {loading ? 'Saving...' : session ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
