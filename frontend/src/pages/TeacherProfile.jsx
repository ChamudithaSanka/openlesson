import React, { useState, useEffect } from 'react';
import { Mail, Phone, Edit2, Save, X, User, AlertCircle, Loader } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

const TeacherProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [editData, setEditData] = useState(profileData);

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/teachers/my-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      // Access the nested teacher object and userId object
      const teacher = data.teacher;
      const teacherData = {
        name: teacher?.fullName || '',
        email: teacher?.userId?.email || '',
        phone: teacher?.phone || '',
      };

      setTeacherId(teacher?._id);
      setProfileData(teacherData);
      setEditData(teacherData);
      setError(null);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        fullName: editData.name,
        phone: editData.phone,
      };

      const response = await fetch(`${API_URL}/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setProfileData(editData);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profileData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="max-w-4xl mx-auto flex justify-center items-center h-96">
            <div className="text-center">
              <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Loading your profile...</p>
            </div>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your personal information</p>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-950 transition duration-200 font-semibold shadow-md"
              >
                <Edit2 size={20} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Content */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {isEditing ? (
              // Edit Mode
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Edit Your Profile</h2>
                
                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-800 transition"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email Field (Disabled) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="Email cannot be changed"
                    />
                    <p className="text-xs text-gray-500 mt-2">Email address cannot be changed for security reasons</p>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-800 transition"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-950 transition duration-200 font-semibold flex-1 justify-center"
                    >
                      <Save size={20} />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold flex-1 justify-center"
                    >
                      <X size={20} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                {/* Profile Header with Avatar */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-950 p-8 text-white">
                  <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 rounded-full border-4 border-white">
                      <span className="text-3xl font-bold">{getInitials(profileData.name)}</span>
                    </div>
                    {/* Name and Role */}
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{profileData.name}</h2>
                      <p className="text-blue-100">Teacher</p>
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="p-8">
                  <div className="space-y-6">
                    {/* Email Section */}
                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-900 bg-opacity-10 rounded-lg flex-shrink-0">
                          <Mail className="text-blue-900" size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                          <p className="text-lg text-gray-800 font-semibold break-all">{profileData.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Phone Section */}
                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-900 bg-opacity-10 rounded-lg flex-shrink-0">
                          <Phone className="text-blue-900" size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                          <p className="text-lg text-gray-800 font-semibold">{profileData.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Role Section */}
                    <div>
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-900 bg-opacity-10 rounded-lg flex-shrink-0">
                          <User className="text-blue-900" size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">Role</p>
                          <p className="text-lg text-gray-800 font-semibold">Teacher</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherProfile;
