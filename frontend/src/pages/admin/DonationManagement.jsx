import { useEffect, useState } from "react";
import { Eye, Edit, Trash2, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

export default function DonationManagement() {
  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";
  const token = localStorage.getItem("token");

  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const [formData, setFormData] = useState({
    paymentStatus: "",
  });

  // Fetch all donations
  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/donations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setDonations(data.donations);
        filterDonations(data.donations, "All");
      } else {
        setError(data.message || "Failed to fetch donations");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterDonations = (donationList, status) => {
    if (status === "All") {
      setFilteredDonations(donationList);
    } else {
      setFilteredDonations(donationList.filter((d) => d.paymentStatus === status));
    }
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    filterDonations(donations, status);
  };

  const handleViewDonation = (donation) => {
    setSelectedDonation(donation);
    setViewModalOpen(true);
  };

  const handleEditDonation = (donation) => {
    setSelectedDonation(donation);
    setFormData({
      paymentStatus: donation.paymentStatus,
    });
    setEditModalOpen(true);
  };

  const handleUpdateDonation = async () => {
    try {
      const response = await fetch(`${API_URL}/donations/${selectedDonation._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setDonations(donations.map((d) => (d._id === selectedDonation._id ? data.donation : d)));
        filterDonations(
          donations.map((d) => (d._id === selectedDonation._id ? data.donation : d)),
          statusFilter
        );
        setEditModalOpen(false);
        alert("Donation updated successfully!");
      } else {
        setError(data.message || "Failed to update donation");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;

    try {
      const response = await fetch(`${API_URL}/donations/${donationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setDonations(donations.filter((d) => d._id !== donationId));
        filterDonations(
          donations.filter((d) => d._id !== donationId),
          statusFilter
        );
        alert("Donation deleted successfully!");
      } else {
        setError(data.message || "Failed to delete donation");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getTotalDonations = () => {
    return donations.reduce((sum, d) => sum + d.amount, 0);
  };

  if (loading) return <AdminLayout><div className="p-6">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Donation Management</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-lg">
            <p className="text-blue-700 font-semibold">Total Donations</p>
            <p className="text-2xl font-bold text-blue-900">LKR {getTotalDonations()}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-green-700 font-semibold">Completed</p>
            <p className="text-2xl font-bold text-green-900">
              {donations.filter((d) => d.paymentStatus === "Completed").length}
            </p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <p className="text-yellow-700 font-semibold">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">
              {donations.filter((d) => d.paymentStatus === "Pending").length}
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex items-center gap-4">
          <label className="font-semibold text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Donations</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <span className="text-gray-600">
            Showing {filteredDonations.length} of {donations.length} donations
          </span>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Donor Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Payment Method</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation) => (
                  <tr key={donation._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">
                      {donation.donorId?.fullName || ((donation.guest?.firstName || "") + (donation.guest?.lastName ? (" " + donation.guest.lastName) : "") || "-")}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {donation.donorId?.email || donation.guest?.email || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">LKR {donation.amount}</td>
                    <td className="px-6 py-4 text-gray-600">{donation.paymentMethod}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          donation.paymentStatus === "Completed"
                            ? "bg-green-100 text-green-800"
                            : donation.paymentStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {donation.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button
                        onClick={() => handleViewDonation(donation)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleEditDonation(donation)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteDonation(donation._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No donations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View Modal */}
        {viewModalOpen && selectedDonation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Donation Details</h2>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-3">
                <p>
                  <strong>Donor:</strong> {selectedDonation.donorId?.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedDonation.donorId?.email}
                </p>
                <p>
                  <strong>Amount:</strong> LKR {selectedDonation.amount}
                </p>
                <p>
                  <strong>Payment Method:</strong> {selectedDonation.paymentMethod}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(selectedDonation.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Message:</strong> {selectedDonation.message || "No message"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      selectedDonation.paymentStatus === "Completed"
                        ? "bg-green-100 text-green-800"
                        : selectedDonation.paymentStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedDonation.paymentStatus}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setViewModalOpen(false)}
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalOpen && selectedDonation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Update Donation Status</h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Donor:</strong> {selectedDonation.donorId?.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Amount:</strong> LKR {selectedDonation.amount}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleUpdateDonation}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
