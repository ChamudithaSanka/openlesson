import { useEffect, useState, useRef } from "react";
import StudentLayout from "../../components/student/Studentlayout";
import { User, Lock, Camera, Save, Eye, EyeOff, BookOpen, MapPin, School, Phone, Mail } from "lucide-react";

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "password"
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [grades, setGrades] = useState([]);
  const fileRef = useRef(null);

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000";
  const studentId = JSON.parse(localStorage.getItem("user") || "{}")._id;

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    schoolName: "",
    district: "",
    gradeId: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await fetch(`${API_URL}/api/grades`);
      const data = await res.json();
      if (data.success) {
        setGrades(data.grades || []);
      }
    } catch (err) {
      console.error("Error fetching grades:", err);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/students/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.student) {
        setStudent(data.student);
        setProfileForm({
          fullName: data.student.fullName || "",
          phone: data.student.phone || "",
          schoolName: data.student.schoolName || "",
          district: data.student.district || "",
          gradeId: data.student.gradeId?._id || data.student.gradeId || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!profileForm.fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/students/my-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profile updated successfully!");
        setStudent(data.student);
        // Keep localStorage in sync
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, fullName: profileForm.fullName }));
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!passwordForm.oldPassword) {
      setError("Current password is required.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/students/change-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password changed successfully!");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.message || "Failed to change password.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePicture", file);
    try {
      const res = await fetch(`${API_URL}/api/students/upload-picture`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setMessage("Profile picture updated!");
        fetchProfile();
      } else {
        setError("Failed to upload picture.");
      }
    } catch {
      setError("Server error uploading picture.");
    }
  };

  const displayName = student?.fullName || "Student";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Populated from student registration data
  const gradeName = student?.gradeId?.gradeName || null;
  const email = student?.userId?.email || "";

  // Info snapshot tiles — all sourced from registered data
  const infoTiles = [
    { icon: Mail, label: "Email", value: email || "—" },
    { icon: Phone, label: "Phone", value: student?.phone || "—" },
    { icon: BookOpen, label: "Grade", value: gradeName || "—" },
    { icon: School, label: "School", value: student?.schoolName || "—" },
    { icon: MapPin, label: "District", value: student?.district || "—" },
  ];

  return (
    <StudentLayout title="My Profile" subtitle="Manage your personal information">
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading profile...</div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-5">

          {/* ── Hero card ── */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 text-white flex items-center gap-5">
            <div className="relative flex-shrink-0">
              {student?.profilePicture ? (
                <img
                  src={`${API_URL}${student.profilePicture}`}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center text-2xl font-bold border-4 border-white/30">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                title="Change profile picture"
                className="absolute bottom-0 right-0 bg-white text-blue-700 rounded-full p-1.5 hover:bg-yellow-300 hover:text-blue-900 transition shadow"
              >
                <Camera size={13} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold truncate">{displayName}</p>
              <p className="text-blue-200 text-sm truncate">{email}</p>
              {gradeName && (
                <span className="mt-2 inline-flex items-center gap-1.5 bg-yellow-400 text-blue-900 text-xs font-bold px-2.5 py-1 rounded-full">
                  <BookOpen size={11} />
                  {gradeName}
                </span>
              )}
            </div>
          </div>

          {/* ── Info snapshot ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {infoTiles.map((item) => {
              // eslint-disable-next-line no-unused-vars
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={13} className="text-blue-500" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {item.label}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.value}</p>
                </div>
              );
            })}
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {[
              { key: "profile", icon: User, label: "Edit Details" },
              { key: "password", icon: Lock, label: "Change Password" },
            ].map(
              // eslint-disable-next-line no-unused-vars
              ({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key); setMessage(""); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === key
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <Icon size={15} /> {label}
                </button>
              )
            )}
          </div>

          {/* ── Alerts ── */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
              ✓ {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* ── Edit Details Form ── */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileUpdate} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">Personal Information</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update your details below.
                </p>
              </div>

              {/* Editable fields */}
              {[
                { label: "Full Name", key: "fullName", type: "text", placeholder: "Your full name", required: true },
                { label: "Phone Number", key: "phone", type: "tel", placeholder: "e.g. +94 77 000 0000" },
                { label: "School Name", key: "schoolName", type: "text", placeholder: "Your school" },
                { label: "District", key: "district", type: "text", placeholder: "Your district" },
              ].map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type={type}
                    value={profileForm[key]}
                    onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              ))}

              {/* Read-only fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-gray-400 text-xs">(read-only)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade <span className="text-red-400">*</span>
                </label>
                <select
                  value={profileForm.gradeId}
                  onChange={(e) => setProfileForm({ ...profileForm, gradeId: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Select your grade</option>
                  {grades.map((g) => (
                    <option key={g._id} value={g._id}>{g.gradeName}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}

          {/* ── Change Password Form ── */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-gray-800">Change Your Password</h2>

              {[
                { label: "Current Password", key: "oldPassword", show: showOldPw, toggle: () => setShowOldPw(!showOldPw) },
                { label: "New Password", key: "newPassword", show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                { label: "Confirm New Password", key: "confirmPassword", show: showConfirmPw, toggle: () => setShowConfirmPw(!showConfirmPw) },
              ].map(({ label, key, show, toggle }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      value={passwordForm[key]}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button type="button" onClick={toggle} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
              >
                <Lock size={15} />
                {saving ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

        </div>
      )}
    </StudentLayout>
  );
}