import { useEffect, useState } from "react";
import { Eye, Edit, Trash2, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

export default function DonorManagement() {
  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";
  const token = localStorage.getItem("token");

  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    companyName: "",
    status: "Active",
  });

  // Validation functions
  const validateName = (name) => {
    if (!name) return 'Name is required';
    if (/\d/.test(name)) return 'Name cannot contain numbers';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validatePhone = (phone) => {
    if (phone === '') return ''; // Phone is optional
    if (!/^\d{10}$/.test(phone)) return 'Phone number must contain exactly 10 digits';
    return '';
  };

  // Fetch all donors
  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/donors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setDonors(data.donors);
        filterDonors(data.donors, "All");
      } else {
        setError(data.message || "Failed to fetch donors");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterDonors = (donorList, status) => {
    if (status === "All") {
      setFilteredDonors(donorList);
    } else {
      setFilteredDonors(donorList.filter((d) => d.status === status));
    }
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    filterDonors(donors, status);
  };

  // Form change handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // Prevent numbers in name field
    if (name === 'fullName') {
      filteredValue = value.replace(/\d/g, '');
    }

    // Prevent letters in phone field - only allow numbers
    if (name === 'phone') {
      filteredValue = value.replace(/[^0-9]/g, '');
    }

    setFormData({
      ...formData,
      [name]: filteredValue,
    });

    // Real-time validation
    let fieldError = '';
    if (name === 'fullName') {
      fieldError = validateName(filteredValue);
    } else if (name === 'phone') {
      fieldError = validatePhone(filteredValue);
    }

    setErrors({
      ...errors,
      [name]: fieldError,
    });
  };

  const handleViewDonor = (donor) => {
    setSelectedDonor(donor);
    setViewModalOpen(true);
  };

  const handleEditDonor = (donor) => {
    setSelectedDonor(donor);
    setFormData({
      fullName: donor.fullName,
      phone: donor.phone || "",
      companyName: donor.companyName || "",
      status: donor.status,
    });
    setErrors({});
    setEditModalOpen(true);
  };

  const handleUpdateDonor = async () => {
    // Validate all fields
    const newErrors = {};
    
    newErrors.fullName = validateName(formData.fullName);
    newErrors.phone = validatePhone(formData.phone);

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      alert('Please fix validation errors before submitting');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/donors/admin/${selectedDonor._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setDonors(donors.map((d) => (d._id === selectedDonor._id ? data.donor : d)));
        filterDonors(
          donors.map((d) => (d._id === selectedDonor._id ? data.donor : d)),
          statusFilter
        );
        setEditModalOpen(false);
        setErrors({});
        alert("Donor updated successfully!");
      } else {
        setError(data.message || "Failed to update donor");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteDonor = async (donorId) => {
    if (!window.confirm("Are you sure you want to delete this donor?")) return;

    try {
      const response = await fetch(`${API_URL}/donors/${donorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setDonors(donors.filter((d) => d._id !== donorId));
        filterDonors(
          donors.filter((d) => d._id !== donorId),
          statusFilter
        );
        alert("Donor deleted successfully!");
      } else {
        setError(data.message || "Failed to delete donor");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <AdminLayout><div className="p-6">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Donor Management</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Filter Section */}
        <div className="mb-6 flex items-center gap-4">
          <label className="font-semibold text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Donors</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <span className="text-gray-600">
            Showing {filteredDonors.length} of {donors.length} donors
          </span>
        </div>

        {/* Donors Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Company</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Total Donated</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Recurring Plan</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.length > 0 ? (
                filteredDonors.map((donor) => (
                  <tr key={donor._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800">{donor.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{donor.userId?.email}</td>
                    <td className="px-6 py-4 text-gray-600">{donor.phone || "N/A"}</td>
                    <td className="px-6 py-4 text-gray-600">{donor.companyName || "N/A"}</td>
                    <td className="px-6 py-4 text-gray-600">LKR {donor.totalDonated}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{donor.recurringPlan}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          donor.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {donor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button
                        onClick={() => handleViewDonor(donor)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleEditDonor(donor)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteDonor(donor._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No donors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* View Modal */}
        {viewModalOpen && selectedDonor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Donor Details</h2>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-3">
                <p>
                  <strong>Name:</strong> {selectedDonor.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedDonor.userId?.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedDonor.phone || "N/A"}
                </p>
                <p>
                  <strong>Company:</strong> {selectedDonor.companyName || "N/A"}
                </p>
                <p>
                  <strong>Total Donated:</strong> LKR {selectedDonor.totalDonated}
                </p>
                <p>
                  <strong>Recurring Plan:</strong> {selectedDonor.recurringPlan.charAt(0).toUpperCase() + selectedDonor.recurringPlan.slice(1)}
                </p>
                <p>
                  <strong>Recurring Amount:</strong> LKR {selectedDonor.recurringAmount}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      selectedDonor.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedDonor.status}
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
        {editModalOpen && selectedDonor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Donor</h2>
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    maxLength="10"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleUpdateDonor}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditModalOpen(false);
                      setErrors({});
                    }}
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
