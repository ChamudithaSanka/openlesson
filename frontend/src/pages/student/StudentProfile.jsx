import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, School, MapPin, Edit2, Save, X, AlertCircle, Loader, Lock, Eye, EyeOff } from 'lucide-react';
import StudentLayout from '../../components/student/Studentlayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  // Phone validation state
  const [phoneError, setPhoneError] = useState('');

  const handleSave = async () => {
    // Phone validation: must be exactly 10 digits (Sri Lankan mobile)
    if (!/^\d{10}$/.test(editData.phone)) {
      setPhoneError('Phone number must be exactly 10 digits.');
      return;
    } else {
      setPhoneError('');
    }
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
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-2">
        <div className="w-full max-w-2xl rounded-3xl bg-white/80 shadow-2xl border border-slate-200/70 backdrop-blur-md p-0 sm:p-2 md:p-4">
          {/* Profile Card Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-6 flex items-center gap-5 text-white rounded-t-3xl shadow-indigo-200/50 shadow-lg relative overflow-hidden">
            {/* Decorative blurred circles like dashboard */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-blue-400/20 rounded-full -ml-6 -mb-6 blur-xl"></div>
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {getInitials(student?.fullName)}
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">{student?.fullName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-100 text-xs font-medium px-2 py-0.5 bg-white/10 rounded-md border border-white/10">Student</span>
                  {student?.gradeId?.gradeName && (
                    <span className="bg-blue-400/30 text-blue-100 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-blue-400/20">
                      {student.gradeId.gradeName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-100 flex px-2 bg-white/80 rounded-b-none rounded-3xl">
            {[{ id: 'info', label: 'Personal Info', icon: User }, { id: 'security', label: 'Security', icon: Lock }].map(
              ({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setError(''); setSuccess(''); }}
                  className={`flex items-center gap-2 px-4 py-3.5 text-[13px] font-semibold border-b-2 transition-all duration-200 ${
                    activeTab === id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              )
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <div className="p-6 bg-white/90 rounded-b-3xl">
              {!isEditing ? (
                <>
                  <div className="flex justify-end mb-6">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-[13px] hover:bg-slate-800 transition shadow-sm"
                    >
                      <Edit2 size={14} /> Edit Profile
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
                      <div key={label} className="flex items-start gap-4 border-b border-slate-50 pb-4 last:border-0 pl-2">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <Icon size={16} className="text-slate-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                          <p className="text-slate-700 font-semibold text-sm mt-0.5">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={editData.fullName || ''}
                        onChange={(e) => setEditData((p) => ({ ...p, fullName: e.target.value }))}
                        placeholder="Your full name"
                        className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 transition text-[13px] bg-white/60 shadow-sm focus:shadow-md"
                      />
                    </div>
                    {/* Phone with validation */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d]/g, '');
                          setEditData((p) => ({ ...p, phone: val }));
                          if (val.length === 10 && /^\d{10}$/.test(val)) {
                            setPhoneError('');
                          } else {
                            setPhoneError('Phone number must be exactly 10 digits.');
                          }
                        }}
                        placeholder="Your phone number"
                        maxLength={10}
                        className={`w-full px-4 py-2 border-2 rounded-xl focus:outline-none transition text-[13px] bg-white/60 shadow-sm focus:shadow-md ${phoneError ? 'border-red-400 focus:border-red-500' : 'border-slate-100 focus:border-blue-500'}`}
                      />
                      {phoneError && (
                        <div className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={14} /> {phoneError}</div>
                      )}
                    </div>
                    {/* School Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">School Name</label>
                      <input
                        type="text"
                        value={editData.schoolName || ''}
                        onChange={(e) => setEditData((p) => ({ ...p, schoolName: e.target.value }))}
                        placeholder="Your school"
                        className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 transition text-[13px] bg-white/60 shadow-sm focus:shadow-md"
                      />
                    </div>
                    {/* District */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">District</label>
                      <input
                        type="text"
                        value={editData.district || ''}
                        onChange={(e) => setEditData((p) => ({ ...p, district: e.target.value }))}
                        placeholder="Your district"
                        className="w-full px-4 py-2 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-blue-500 transition text-[13px] bg-white/60 shadow-sm focus:shadow-md"
                      />
                    </div>

                    {/* Email - read only */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email (read-only)</label>
                      <input
                        type="email"
                        value={student?.userId?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border-2 border-slate-100 rounded-lg bg-slate-50 text-slate-400 text-[13px] cursor-not-allowed"
                      />
                    </div>

                    {/* Grade - read only */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Grade (assigned by admin)</label>
                      <input
                        type="text"
                        value={student?.gradeId?.gradeName || '—'}
                        disabled
                        className="w-full px-4 py-2 border-2 border-slate-100 rounded-lg bg-slate-50 text-slate-400 text-[13px] cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 mt-4 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handleSave}
                      disabled={saving || !!phoneError}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-700 to-blue-700 hover:from-indigo-800 hover:to-blue-800 text-white rounded-xl font-bold text-[13px] transition disabled:opacity-60 shadow-md ${saving || phoneError ? 'cursor-not-allowed' : ''}`}
                    >
                      <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setError(''); setPhoneError(''); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-[13px] transition shadow"
                    >
                      <X size={14} /> Cancel
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
            <div className="p-6 bg-white/90 rounded-b-3xl">
              <h3 className="text-base font-bold text-slate-800 mb-5">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                {[
                  { label: 'Current Password', key: 'currentPassword', show: showPw.current, toggle: () => setShowPw((p) => ({ ...p, current: !p.current })) },
                  { label: 'New Password', key: 'newPassword', show: showPw.new, toggle: () => setShowPw((p) => ({ ...p, new: !p.new })) },
                  { label: 'Confirm New Password', key: 'confirmPassword', show: showPw.confirm, toggle: () => setShowPw((p) => ({ ...p, confirm: !p.confirm })) },
                ].map(({ label, key, show, toggle }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={pwForm[key]}
                        onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                        className="w-full px-4 py-2 pr-11 border-2 border-slate-100 rounded-lg focus:outline-none focus:border-blue-500 transition text-[13px] bg-slate-50/30"
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
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[13px] transition disabled:opacity-60 shadow-sm"
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