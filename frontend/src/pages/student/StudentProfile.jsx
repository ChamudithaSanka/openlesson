import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, School, MapPin, Edit2, Save, X, AlertCircle, Loader, Lock, Eye, EyeOff } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const API = 'http://localhost:5000';

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password change state
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'security'
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const token = localStorage.getItem('token');

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/students/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStudent(data.student);
        setEditData({
          fullName: data.student.fullName || '',
          phone: data.student.phone || '',
          schoolName: data.student.schoolName || '',
          district: data.student.district || '',
        });
      }
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const res = await fetch(`${API}/api/students/my-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setStudent(data.student);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwError('New passwords do not match.');
    }
    if (pwForm.newPassword.length < 6) {
      return setPwError('Password must be at least 6 characters.');
    }
    try {
      setPwLoading(true);
      const res = await fetch(`${API}/api/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password change failed');
      setPwSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const getInitials = (name) =>
    (name || 'S').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <StudentLayout title="Profile">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader size={40} className="animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="My Profile">
      <div className="p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500 mt-2">Manage your personal information and account security.</p>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-6 flex items-center gap-5 text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center text-3xl font-bold">
              {getInitials(student?.fullName)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{student?.fullName}</h2>
              <p className="text-indigo-200 text-sm mt-0.5">Student</p>
              {student?.gradeId?.gradeName && (
                <span className="inline-block mt-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {student.gradeId.gradeName}
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 flex">
            {[{ id: 'info', label: 'Personal Info', icon: User }, { id: 'security', label: 'Security', icon: Lock }].map(
              ({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setError(''); setSuccess(''); }}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition ${
                    activeTab === id
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              )
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="p-6">
              {!isEditing ? (
                <>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition"
                    >
                      <Edit2 size={16} /> Edit Profile
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { icon: User, label: 'Full Name', value: student?.fullName },
                      { icon: Mail, label: 'Email', value: student?.userId?.email },
                      { icon: Phone, label: 'Phone', value: student?.phone || '—' },
                      { icon: School, label: 'School', value: student?.schoolName || '—' },
                      { icon: MapPin, label: 'District', value: student?.district || '—' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-4 border-b border-gray-50 pb-4 last:border-0">
                        <div className="bg-indigo-50 p-2.5 rounded-lg">
                          <Icon size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                          <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    {[
                      { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Your full name' },
                      { label: 'Phone', key: 'phone', type: 'tel', placeholder: 'Your phone number' },
                      { label: 'School Name', key: 'schoolName', type: 'text', placeholder: 'Your school' },
                      { label: 'District', key: 'district', type: 'text', placeholder: 'Your district' },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                        <input
                          type={type}
                          value={editData[key] || ''}
                          onChange={(e) => setEditData((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm"
                        />
                      </div>
                    ))}

                    {/* Email - read only */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email (read-only)</label>
                      <input
                        type="email"
                        value={student?.userId?.email || ''}
                        disabled
                        className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                      />
                    </div>

                    {/* Grade - read only */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Grade (assigned by admin)</label>
                      <input
                        type="text"
                        value={student?.gradeId?.gradeName || '—'}
                        disabled
                        className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 mt-4 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition disabled:opacity-60"
                    >
                      <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setError(''); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </>
              )}

              {success && (
                <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm">
                  ✓ {success}
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                {[
                  { label: 'Current Password', key: 'currentPassword', show: showPw.current, toggle: () => setShowPw((p) => ({ ...p, current: !p.current })) },
                  { label: 'New Password', key: 'newPassword', show: showPw.new, toggle: () => setShowPw((p) => ({ ...p, new: !p.new })) },
                  { label: 'Confirm New Password', key: 'confirmPassword', show: showPw.confirm, toggle: () => setShowPw((p) => ({ ...p, confirm: !p.confirm })) },
                ].map(({ label, key, show, toggle }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={pwForm[key]}
                        onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-4 py-2.5 pr-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                ))}

                {pwError && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
                    <AlertCircle size={16} /> {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm">
                    ✓ {pwSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition disabled:opacity-60"
                >
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;