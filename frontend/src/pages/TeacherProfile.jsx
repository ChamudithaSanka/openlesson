import React, { useState, useEffect } from 'react';
import { Mail, Phone, Edit2, Save } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

const TeacherProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
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

      const response = await fetch('http://localhost:5000/api/teachers/my-profile', {
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

      const response = await fetch(`http://localhost:5000/api/teachers/${teacherId}`, {
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

  if (loading) {
    return (
      <TeacherLayout>
        <div className="p-8 bg-gray-100 min-h-screen">
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-gray-600">Loading profile...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-950 transition"
              >
                <Edit2 size={20} />
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {isEditing ? (
              // Edit Mode
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-950 transition"
                  >
                    <Save size={20} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="space-y-6">
                <div className="pb-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <Mail className="text-blue-900 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800 font-semibold">{profileData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="text-blue-900 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-800 font-semibold">{profileData.phone}</p>
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
