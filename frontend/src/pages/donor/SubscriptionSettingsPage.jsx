import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DonorLayout from "../../components/donor/DonorLayout";

const getApiBase = () => import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatLKR = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const isSuccessfulDonation = (status = "") => {
  const normalized = String(status).toLowerCase();
  return ["succeeded", "success", "completed", "paid"].includes(normalized);
};

const resolveDonorId = async (headers) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user?.profile?._id) {
    return user.profile._id;
  }

  const meRes = await axios.get(`${getApiBase()}/api/auth/me`, { headers });
  return meRes.data?.user?.profile?._id || "";
};

const getNextBillingDate = (donor, donations) => {
  if (!donor?.isSubscriptionEnabled || donor?.recurringPlan === "none") return "-";

  const latestSuccessful = donations.find((item) => isSuccessfulDonation(item.paymentStatus));
  if (!latestSuccessful?.createdAt) return "-";

  const billingDate = new Date(latestSuccessful.createdAt);
  if (donor.recurringPlan === "monthly") {
    billingDate.setMonth(billingDate.getMonth() + 1);
  } else if (donor.recurringPlan === "yearly") {
    billingDate.setFullYear(billingDate.getFullYear() + 1);
  }

  return formatDate(billingDate);
};

export default function SubscriptionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [togglingSubscription, setTogglingSubscription] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [donorId, setDonorId] = useState("");
  const [donorProfile, setDonorProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [subscriptionForm, setSubscriptionForm] = useState({ recurringPlan: "none", recurringAmount: "" });

  const nextBillingDate = useMemo(() => getNextBillingDate(donorProfile, donations), [donorProfile, donations]);

  const monthlyActive = donorProfile?.isSubscriptionEnabled && donorProfile?.recurringPlan === "monthly";
  const yearlyActive = donorProfile?.isSubscriptionEnabled && donorProfile?.recurringPlan === "yearly";

  const syncLocalUser = (updatedDonor) => {
    try {
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          profile: {
            ...(existingUser.profile || {}),
            ...(updatedDonor || {}),
          },
        })
      );
    } catch {
      // Ignore local storage parsing errors.
    }
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

      const [profileRes, donationsRes] = await Promise.all([
        axios.get(`${getApiBase()}/api/donors/profile/${resolvedDonorId}`, { headers }),
        axios.get(`${getApiBase()}/api/donations/my/${resolvedDonorId}`, { headers }),
      ]);

      const profile = profileRes.data?.donor || null;
      setDonorProfile(profile);
      setDonations(donationsRes.data?.donations || []);
      setSubscriptionForm({
        recurringPlan: profile?.recurringPlan || "none",
        recurringAmount: String(profile?.recurringAmount || ""),
      });
      syncLocalUser(profile);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subscription settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleSubscriptionChange = (field, value) => {
    setSubscriptionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSubscription = async (e) => {
    e.preventDefault();
    setSavingSubscription(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        recurringPlan: subscriptionForm.recurringPlan,
        recurringAmount: subscriptionForm.recurringPlan === "none" ? 0 : Number(subscriptionForm.recurringAmount || 0),
      };

      const res = await axios.put(`${getApiBase()}/api/donors/subscription/${donorId}`, payload, { headers });
      const updatedDonor = res.data?.donor || donorProfile;
      setDonorProfile(updatedDonor);
      setSubscriptionForm({
        recurringPlan: updatedDonor?.recurringPlan || "none",
        recurringAmount: String(updatedDonor?.recurringAmount || ""),
      });
      syncLocalUser(updatedDonor);
      setMessage("Subscription plan updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update subscription.");
    } finally {
      setSavingSubscription(false);
    }
  };

  const handleToggleSubscription = async () => {
    setTogglingSubscription(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const enabled = !Boolean(donorProfile?.isSubscriptionEnabled);

      const res = await axios.patch(
        `${getApiBase()}/api/donors/subscription/${donorId}/toggle`,
        { enabled },
        { headers }
      );

      const updatedDonor = res.data?.donor || donorProfile;
      setDonorProfile(updatedDonor);
      syncLocalUser(updatedDonor);
      setMessage(enabled ? "Subscription resumed." : "Subscription paused.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update subscription status.");
    } finally {
      setTogglingSubscription(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancellingSubscription(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.put(
        `${getApiBase()}/api/donors/subscription/${donorId}`,
        { recurringPlan: "none", recurringAmount: 0 },
        { headers }
      );

      const updatedDonor = res.data?.donor || donorProfile;
      setDonorProfile(updatedDonor);
      setSubscriptionForm({ recurringPlan: "none", recurringAmount: "" });
      syncLocalUser(updatedDonor);
      setMessage("Subscription canceled.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel subscription.");
    } finally {
      setCancellingSubscription(false);
    }
  };

  if (loading) {
    return (
      <DonorLayout>
        <div className="p-6 text-sm text-slate-600">Loading subscription settings...</div>
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
          <h1 className="text-2xl font-bold text-blue-900">Subscription Settings</h1>
          <p className="mt-1 text-sm text-blue-700">Manage your monthly or yearly donation plan.</p>
        </header>

        {message ? <p className="rounded-md bg-green-50 p-3 text-sm font-medium text-green-700">{message}</p> : null}
        {error ? <p className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="space-y-6 xl:col-span-2">
            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-blue-900">Active Subscriptions</h2>
              <p className="mt-1 text-sm text-blue-700">
                View monthly/yearly status, edit amount, pause/resume/cancel, and next billing date.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">
                  <p className="font-medium">Monthly Plan</p>
                  <p>Status: {monthlyActive ? "Active" : "Inactive"}</p>
                  <p>Amount: {donorProfile?.recurringPlan === "monthly" ? formatLKR(donorProfile?.recurringAmount) : formatLKR(0)}</p>
                </div>
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">
                  <p className="font-medium">Yearly Plan</p>
                  <p>Status: {yearlyActive ? "Active" : "Inactive"}</p>
                  <p>Amount: {donorProfile?.recurringPlan === "yearly" ? formatLKR(donorProfile?.recurringAmount) : formatLKR(0)}</p>
                </div>
              </div>

              <p className="mt-3 text-sm text-blue-900">
                <span className="font-medium">Next Billing Date:</span> {nextBillingDate}
              </p>

              <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSaveSubscription}>
                <label className="text-sm text-blue-900">
                  <span className="mb-1 block font-medium">Plan</span>
                  <select
                    value={subscriptionForm.recurringPlan}
                    onChange={(e) => handleSubscriptionChange("recurringPlan", e.target.value)}
                    className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
                  >
                    <option value="none">None</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>

                <label className="text-sm text-blue-900">
                  <span className="mb-1 block font-medium">Amount (LKR)</span>
                  <input
                    type="number"
                    min="0"
                    value={subscriptionForm.recurringAmount}
                    onChange={(e) => handleSubscriptionChange("recurringAmount", e.target.value)}
                    disabled={subscriptionForm.recurringPlan === "none"}
                    className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2 disabled:bg-slate-100"
                    placeholder="5000"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                  <button
                    type="submit"
                    disabled={savingSubscription}
                    className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingSubscription ? "Updating..." : "Update Plan"}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleSubscription}
                    disabled={togglingSubscription || donorProfile?.recurringPlan === "none"}
                    className="rounded-md border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-800 hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {togglingSubscription ? "Working..." : donorProfile?.isSubscriptionEnabled ? "Pause" : "Resume"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    disabled={cancellingSubscription || donorProfile?.recurringPlan === "none"}
                    className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cancellingSubscription ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                </div>
              </form>
            </article>
          </section>

          <aside className="space-y-6">
            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-blue-900">Current Summary</h2>
              <div className="mt-3 space-y-2 text-sm text-blue-900">
                <p><span className="font-medium">Current plan:</span> {donorProfile?.recurringPlan || "none"}</p>
                <p><span className="font-medium">Subscription status:</span> {donorProfile?.isSubscriptionEnabled ? "Enabled" : "Disabled"}</p>
                <p><span className="font-medium">Recurring amount:</span> {formatLKR(donorProfile?.recurringAmount)}</p>
                <p><span className="font-medium">Next billing:</span> {nextBillingDate}</p>
              </div>
            </article>

            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-blue-900">Recent Donation Signal</h2>
              <p className="mt-2 text-sm text-blue-800">
                Successful donations recorded: {donations.filter((item) => isSuccessfulDonation(item.paymentStatus)).length}
              </p>
              <p className="text-sm text-blue-800">Total records: {donations.length}</p>
            </article>
          </aside>
        </div>
      </section>
    </DonorLayout>
  );
}