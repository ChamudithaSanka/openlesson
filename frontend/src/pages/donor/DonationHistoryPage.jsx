import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DonorLayout from "../../components/donor/DonorLayout";
import DonationDetailsModal from "../../components/donor/DonationDetailsModal";

const formatLKR = (amount) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const getDonationType = (donation = {}) => {
  if (donation?.donationType) {
    return String(donation.donationType).toLowerCase();
  }

  const method = String(donation?.paymentMethod || "").toLowerCase();
  if (method.includes("monthly")) return "monthly";
  if (method.includes("yearly") || method.includes("annual")) return "yearly";
  return "one-time";
};

const statusBadgeClass = (status = "") => {
  const normalized = String(status).toLowerCase();

  if (normalized === "completed") {
    return "bg-green-100 text-green-700";
  }

  if (normalized === "failed") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
};


export default function DonationHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "all",
    status: "all",
  });
  // Delete donation handler
  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm("Are you sure you want to delete this donation? This action cannot be undone.")) return;
    setActionLoading(true);
    setActionError("");
    setActionSuccess("");
    try {
      const token = localStorage.getItem("token");
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      await axios.delete(`${apiBase}/api/donations/${donationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonations((prev) => prev.filter((d) => d._id !== donationId));
      if (selectedDonation?._id === donationId) setSelectedDonation(null);
      setActionSuccess("Donation deleted successfully.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to delete donation.");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const loadDonations = async () => {
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

        if (!donorId) {
          const meRes = await axios.get(`${apiBase}/api/auth/me`, { headers });
          donorId = meRes.data?.user?.profile?._id;
        }

        if (!donorId) {
          setError("Donor profile not found. Please log in again.");
          setLoading(false);
          return;
        }

        const donationsRes = await axios.get(`${apiBase}/api/donations/my/${donorId}`, { headers });
        const fetched = donationsRes.data?.donations || [];

        setDonations(fetched);
        setSelectedDonation(fetched[0] || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load donation history.");
      } finally {
        setLoading(false);
      }
    };

    loadDonations();
  }, []);

  const filteredDonations = useMemo(() => {
    return donations.filter((item) => {
      const createdAt = item?.createdAt ? new Date(item.createdAt) : null;
      const type = getDonationType(item);

      if (filters.startDate && createdAt) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        if (createdAt < start) return false;
      }

      if (filters.endDate && createdAt) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (createdAt > end) return false;
      }

      if (filters.type !== "all" && type !== filters.type) {
        return false;
      }

      if (
        filters.status !== "all" &&
        String(item?.paymentStatus || "").toLowerCase() !== filters.status
      ) {
        return false;
      }

      return true;
    });
  }, [donations, filters]);

  const totalFiltered = useMemo(
    () => filteredDonations.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [filteredDonations]
  );

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      type: "all",
      status: "all",
    });
  };

  if (loading) {
    return (
      <DonorLayout>
        <div className="p-6 text-sm text-slate-600">Loading donation history...</div>
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
          <h1 className="text-2xl font-bold text-blue-900">Donation History</h1>
          <p className="mt-1 text-sm text-blue-700">
            View and filter your donations by date, type, and status.
          </p>
        </header>

        {actionError && (
          <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 border border-red-200">{actionError}</div>
        )}
        {actionSuccess && (
          <div className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700 border border-green-200">{actionSuccess}</div>
        )}

        <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">From date</span>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onFilterChange("startDate", e.target.value)}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
              />
            </label>

            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">To date</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onFilterChange("endDate", e.target.value)}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
              />
            </label>

            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">Donation type</span>
              <select
                value={filters.type}
                onChange={(e) => onFilterChange("type", e.target.value)}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
              >
                <option value="all">All</option>
                <option value="one-time">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>

            <label className="text-sm text-blue-900">
              <span className="mb-1 block font-medium">Status</span>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange("status", e.target.value)}
                className="w-full rounded-md border border-blue-200 px-3 py-2 outline-none ring-blue-600 focus:border-blue-400 focus:ring-2"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm font-medium text-blue-800 hover:border-blue-400"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-800">
              Records: {filteredDonations.length}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-800">
              Total: {formatLKR(totalFiltered)}
            </span>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-blue-100 text-blue-700">
                    <th className="px-2 py-2 font-semibold">Date</th>
                    <th className="px-2 py-2 font-semibold">Amount</th>
                    <th className="px-2 py-2 font-semibold">Type</th>
                    <th className="px-2 py-2 font-semibold">Status</th>
                    <th className="px-2 py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((donation) => (
                    <tr key={donation._id} className="border-b border-blue-50 last:border-b-0">
                      <td className="px-2 py-2 text-blue-900">{formatDate(donation.createdAt)}</td>
                      <td className="px-2 py-2 font-medium text-blue-900">
                        {formatLKR(Number(donation.amount || 0))}
                      </td>
                      <td className="px-2 py-2 capitalize text-blue-900">
                        {getDonationType(donation)}
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(
                            donation.paymentStatus
                          )}`}
                        >
                          {donation.paymentStatus || "Pending"}
                        </span>
                      </td>
                      <td className="px-2 py-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDonation(donation);
                            setModalOpen(true);
                          }}
                          className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-800 hover:border-blue-400"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleDeleteDonation(donation._id)}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                        >
                          {actionLoading ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredDonations.length && (
                    <tr>
                      <td colSpan={5} className="px-2 py-4 text-blue-700">
                        No donations found for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Modal for donation details */}
          <DonationDetailsModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            donation={selectedDonation}
            formatDate={formatDate}
            formatLKR={formatLKR}
            getDonationType={getDonationType}
          />
        </div>
      </section>
    </DonorLayout>
  );
}