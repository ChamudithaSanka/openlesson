import { useEffect, useState } from "react";
import axios from "axios";
import DonorLayout from "../../components/donor/DonorLayout";

const getApiBase = () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const resolveDonorId = async (headers) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user?.profile?._id) {
    return user.profile._id;
  }

  const meRes = await axios.get(`${getApiBase()}/api/auth/me`, { headers });
  return meRes.data?.user?.profile?._id || "";
};

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [donorId, setDonorId] = useState("");
  const [donorProfile, setDonorProfile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Sri Lanka",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const syncLocalUser = (updatedDonor) => {
    try {
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      const nextUser = {
        ...existingUser,
        email: updatedDonor?.userId?.email || existingUser.email,
        profile: {
          ...(existingUser.profile || {}),
          ...(updatedDonor || {}),
        },
      };
      localStorage.setItem("user", JSON.stringify(nextUser));
    } catch {
      // Ignore local storage parse failures.
    }
  };

  const hydrateState = (profile) => {
    setDonorProfile(profile || null);
    setProfileForm({
      fullName: profile?.fullName || "",
      email: profile?.userId?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      city: profile?.city || "",
      country: profile?.country || "Sri Lanka",
    });
  };

  const loadPageData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Donor session not found. Please log in again.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const resolvedDonorId = await resolveDonorId(headers);

      if (!resolvedDonorId) {
        setError("Donor profile not found. Please log in again.");
        setLoading(false);
        return;
      }

      setDonorId(resolvedDonorId);
      const profileRes = await axios.get(`${getApiBase()}/api/donors/profile/${resolvedDonorId}`, { headers });
      const profile = profileRes.data?.donor || null;

      hydrateState(profile);
      syncLocalUser(profile);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(
        `${getApiBase()}/api/donors/profile/${donorId}`,
        {
          fullName: profileForm.fullName.trim(),
          email: profileForm.email.trim(),
          phone: profileForm.phone.trim(),
          address: profileForm.address.trim(),
          city: profileForm.city.trim(),
          country: profileForm.country.trim(),
        },
        { headers }
      );

      const updatedDonor = res.data?.donor || donorProfile;
      setDonorProfile(updatedDonor);
      syncLocalUser(updatedDonor);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(
        `${getApiBase()}/api/auth/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        },
        { headers }
      );

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage(res.data?.message || "Password updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <DonorLayout>
        <div className="p-6 text-sm text-slate-600">Loading profile settings...</div>
      </DonorLayout>
    );
  }

  if (error && !donorProfile) {
    return (
      <DonorLayout>
        <div className="p-6 text-sm font-medium text-red-600">{error}</div>
      </DonorLayout>
    );
  }

  return (
    <DonorLayout>
      <section className="space-y-6 p-6">
        <header className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold text-blue-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-blue-700">Update your donor details and account password.</p>
        </header>

        {message ? <p className="rounded-md bg-green-50 p-3 text-sm font-medium text-green-700">{message}</p> : null}
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-900">View/Edit Donor Profile</h2>
            <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSaveProfile}>
              <label className="text-sm text-blue-900">
                <span className="mb-1 block font-medium">Name</span>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => handleProfileChange("fullName", e.target.value)}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                  required
                />
              </label>

              <label className="text-sm text-blue-900">
                <span className="mb-1 block font-medium">Phone</span>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                  placeholder="07X XXX XXXX"
                />
              </label>

              <label className="text-sm text-blue-900 md:col-span-2">
                <span className="mb-1 block font-medium">Email</span>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                  required
                />
              </label>

              <label className="text-sm text-blue-900 md:col-span-2">
                <span className="mb-1 block font-medium">Address</span>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => handleProfileChange("address", e.target.value)}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                  placeholder="Street address"
                />
              </label>

              <label className="text-sm text-blue-900">
                <span className="mb-1 block font-medium">City</span>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => handleProfileChange("city", e.target.value)}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                  placeholder="Colombo"
                />
              </label>

              <label className="text-sm text-blue-900">
                <span className="mb-1 block font-medium">Country</span>
                <input
                  type="text"
                  value={profileForm.country}
                  onChange={(e) => handleProfileChange("country", e.target.value)}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                  placeholder="Sri Lanka"
                />
              </label>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </article>

          <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-900">Change Password</h2>
            <p className="mt-1 text-sm text-blue-700">Use a strong password to keep your donor account secure.</p>
            <form className="mt-4 grid gap-4" onSubmit={handleSavePassword}>
              <label className="text-sm text-blue-900">
                <span className="mb-1 block font-medium">Current Password</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                  required
                />
              </label>

              <label className="text-sm text-blue-900">
                <span className="mb-1 block font-medium">New Password</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                  required
                />
              </label>

              <label className="text-sm text-blue-900">
                <span className="mb-1 block font-medium">Confirm New Password</span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                  required
                />
              </label>

              <div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </article>
        </div>
      </section>
    </DonorLayout>
  );
}