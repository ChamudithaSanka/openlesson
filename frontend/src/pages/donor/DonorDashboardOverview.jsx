import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import DonorLayout from "../../components/donor/DonorLayout";

const formatLKR = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);

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

const getDerivedType = (donation = {}) => {
  if (donation?.donationType) {
    return String(donation.donationType).replace(/-/g, " ");
  }

  const method = String(donation?.paymentMethod || "").toLowerCase();
  if (method.includes("monthly")) return "Monthly";
  if (method.includes("yearly") || method.includes("annual")) return "Yearly";
  return "One-time";
};

const getNextBillingDate = (donor, donations) => {
  if (!donor?.isSubscriptionEnabled || donor?.recurringPlan === "none") {
    return "-";
  }

  const latestDonation = donations.find((item) => isSuccessfulDonation(item.paymentStatus));
  if (!latestDonation?.createdAt) return "-";

  const billingDate = new Date(latestDonation.createdAt);
  if (donor.recurringPlan === "monthly") {
    billingDate.setMonth(billingDate.getMonth() + 1);
  } else if (donor.recurringPlan === "yearly") {
    billingDate.setFullYear(billingDate.getFullYear() + 1);
  }

  return formatDate(billingDate);
};

export default function DonorDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donorProfile, setDonorProfile] = useState(null);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        let donorId = user?.profile?._id;

        if (!token) {
          setError("Donor session not found. Please log in again.");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        // Fallback for stale local storage where profile is missing or outdated.
        if (!donorId) {
          const meRes = await axios.get(`${apiBase}/api/auth/me`, { headers });
          donorId = meRes.data?.user?.profile?._id;
        }

        if (!donorId) {
          setError("Donor profile not found. Please log in again.");
          setLoading(false);
          return;
        }

        const [profileRes, donationsRes] = await Promise.all([
          axios.get(`${apiBase}/api/donors/profile/${donorId}`, { headers }),
          axios.get(`${apiBase}/api/donations/my/${donorId}`, { headers }),
        ]);

        setDonorProfile(profileRes.data?.donor || null);
        setDonations(donationsRes.data?.donations || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load donor dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const stats = useMemo(() => {
    const successful = donations.filter((item) => isSuccessfulDonation(item.paymentStatus));
    const currentYear = new Date().getFullYear();

    const totalDonated = successful.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalDonations = successful.length;
    const activeRecurring = donorProfile?.isSubscriptionEnabled && donorProfile?.recurringPlan !== "none" ? 1 : 0;
    const yearlyContribution = successful
      .filter((item) => new Date(item.createdAt).getFullYear() === currentYear)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      totalDonated,
      totalDonations,
      activeRecurring,
      yearlyContribution,
    };
  }, [donations, donorProfile]);

  const recentDonations = useMemo(() => donations.slice(0, 5), [donations]);

  const monthlyStatus = donorProfile?.recurringPlan === "monthly" && donorProfile?.isSubscriptionEnabled;
  const yearlyStatus = donorProfile?.recurringPlan === "yearly" && donorProfile?.isSubscriptionEnabled;
  const nextBillingDate = getNextBillingDate(donorProfile, donations);

  if (loading) {
    return (
      <DonorLayout>
        <div className="p-6 text-sm text-slate-600">Loading donor dashboard...</div>
      </DonorLayout>
    );
  }

  if (error) {
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
            <h1 className="text-2xl font-bold text-blue-900">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-blue-700">
              Welcome back. Here is a quick summary of your donations and active support.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-blue-700">Total Donated</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">{formatLKR(stats.totalDonated)}</p>
            </article>
            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-blue-700">Donations Made</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">{stats.totalDonations}</p>
            </article>
            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-blue-700">Active Recurring</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">{stats.activeRecurring}</p>
              <p className="mt-1 text-xs text-blue-600">Monthly + yearly plans</p>
            </article>
            <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-blue-700">Yearly Contribution</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">{formatLKR(stats.yearlyContribution)}</p>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-blue-900">Recent Donations</h2>
                <span className="text-xs text-blue-700">Last 5 records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-blue-100 text-blue-700">
                      <th className="px-2 py-2 font-semibold">Date</th>
                      <th className="px-2 py-2 font-semibold">Amount</th>
                      <th className="px-2 py-2 font-semibold">Type</th>
                      <th className="px-2 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDonations.map((donation) => (
                      <tr key={donation._id} className="border-b border-blue-50 last:border-b-0">
                        <td className="px-2 py-2 text-blue-900">{formatDate(donation.createdAt)}</td>
                        <td className="px-2 py-2 font-medium text-blue-900">{formatLKR(Number(donation.amount || 0))}</td>
                        <td className="px-2 py-2 text-blue-900">{getDerivedType(donation)}</td>
                        <td className="px-2 py-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              isSuccessfulDonation(donation.paymentStatus)
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {donation.paymentStatus || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!recentDonations.length && (
                      <tr>
                        <td className="px-2 py-3 text-blue-700" colSpan={4}>
                          No donations available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-6">
              <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-blue-900">Active Subscriptions</h2>
                <div className="mt-3 space-y-3 text-sm text-blue-900">
                  <div className="rounded-md bg-blue-50 p-3">
                    <p className="font-medium">Monthly Plan</p>
                    <p>Status: {monthlyStatus ? "Active" : "Inactive"}</p>
                    <p>
                      Amount:{" "}
                      {donorProfile?.recurringPlan === "monthly"
                        ? formatLKR(Number(donorProfile?.recurringAmount || 0))
                        : formatLKR(0)}
                    </p>
                    <p>Next billing: {monthlyStatus ? nextBillingDate : "-"}</p>
                  </div>
                  <div className="rounded-md bg-blue-50 p-3">
                    <p className="font-medium">Yearly Plan</p>
                    <p>Status: {yearlyStatus ? "Active" : "Inactive"}</p>
                    <p>
                      Amount:{" "}
                      {donorProfile?.recurringPlan === "yearly"
                        ? formatLKR(Number(donorProfile?.recurringAmount || 0))
                        : formatLKR(0)}
                    </p>
                    <p>Next billing: {yearlyStatus ? nextBillingDate : "-"}</p>
                  </div>
                </div>
              </article>

              <article className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-blue-900">Quick Actions</h2>
                <div className="mt-3 space-y-2 text-sm text-blue-900">
                  <Link
                    to="/donor/history"
                    className="block w-full rounded-md border border-blue-200 px-3 py-2 text-left font-medium hover:border-blue-400"
                  >
                    View Full History ({donations.length} records)
                  </Link>
                  <Link
                    to="/donor/subscription"
                    className="w-full rounded-md border border-blue-200 px-3 py-2 text-left font-medium hover:border-blue-400"
                  >
                    Manage Recurring Plan ({donorProfile?.recurringPlan || "none"})
                  </Link>
                  <Link
                    to="/donor/settings"
                    className="block w-full rounded-md border border-blue-200 px-3 py-2 text-left font-medium hover:border-blue-400"
                  >
                    Edit Profile ({donorProfile?.fullName || "Profile"})
                  </Link>
                </div>
              </article>
            </section>
          </div>
      </section>
    </DonorLayout>
  );
}
