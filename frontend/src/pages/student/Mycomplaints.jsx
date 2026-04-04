import { useEffect, useState } from "react";
import StudentLayout from "../../components/student/Studentlayout";
import { Plus, Eye, Edit2, Trash2, X, AlertCircle } from "lucide-react";

const CATEGORIES = ["Login Issue", "Video/Content Issue", "Technical Bug", "Payment Issue", "Other"];

const STATUS_COLORS = {
  Open: "bg-red-100 text-red-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
  Resolved: "bg-green-100 text-green-700",
};

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        {children}
      </div>
    </div>
  );
}

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // "create" | "view" | "edit"
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const [form, setForm] = useState({ subject: "", description: "", category: "Other" });

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/complaints/my-complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({ subject: "", description: "", category: "Other" });
    setMessage("");
    setError("");
    setModalType("create");
    setShowModal(true);
  };

  const openView = (complaint) => {
    setSelected(complaint);
    setModalType("view");
    setShowModal(true);
  };

  const openEdit = (complaint) => {
    setSelected(complaint);
    setForm({
      subject: complaint.subject,
      description: complaint.description,
      category: complaint.category,
    });
    setMessage("");
    setError("");
    setModalType("edit");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError("Subject and description are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const isEdit = modalType === "edit";
      const res = await fetch(
        isEdit
          ? `${API_URL}/api/complaints/${selected._id}`
          : `${API_URL}/api/complaints`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage(isEdit ? "Complaint updated successfully!" : "Complaint submitted successfully!");
        fetchComplaints();
        setTimeout(() => {
          setShowModal(false);
          setMessage("");
        }, 1200);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Server error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (complaint) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      const res = await fetch(`${API_URL}/api/complaints/${complaint._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComplaints(complaints.filter((c) => c._id !== complaint._id));
      } else {
        alert("Failed to delete complaint.");
      }
    } catch {
      alert("Server error.");
    }
  };

  const filtered =
    filterStatus === "All"
      ? complaints
      : complaints.filter((c) => c.status === filterStatus);

  const counts = {
    Open: complaints.filter((c) => c.status === "Open").length,
    "Under Review": complaints.filter((c) => c.status === "Under Review").length,
    Resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  return (
    <StudentLayout title="My Complaints" subtitle="Track and manage your submitted complaints">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Stats + Create */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3 flex-wrap">
            {Object.entries(counts).map(([status, count]) => (
              <div
                key={status}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${STATUS_COLORS[status]} border-current/20`}
              >
                {status}: {count}
              </div>
            ))}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <Plus size={16} />
            New Complaint
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {["All", "Open", "Under Review", "Resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading complaints...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <AlertCircle className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No complaints found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filterStatus === "All" ? "You haven't submitted any complaints yet." : `No ${filterStatus} complaints.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((complaint) => {
              const canEdit = complaint.status === "Open";
              return (
                <div
                  key={complaint._id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800 truncate">{complaint.subject}</p>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[complaint.status]}`}>
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          {complaint.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {complaint.adminNote && (
                        <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
                          <span className="font-semibold">Admin Note: </span>{complaint.adminNote}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => openView(complaint)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => openEdit(complaint)}
                            className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(complaint)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          {/* View Modal */}
          {modalType === "view" && selected && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800">Complaint Details</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subject</p>
                  <p className="text-gray-800 font-semibold">{selected.subject}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{selected.description}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</p>
                    <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {selected.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                </div>
                {selected.adminNote && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Admin Note</p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      {selected.adminNote}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Submitted on {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition"
              >
                Close
              </button>
            </div>
          )}

          {/* Create / Edit Modal */}
          {(modalType === "create" || modalType === "edit") && (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800">
                  {modalType === "create" ? "Submit New Complaint" : "Edit Complaint"}
                </h2>
                <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {message && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  {message}
                </div>
              )}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief title of the issue"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                {modalType === "edit" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}
                {modalType === "create" && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-700 flex items-center gap-2 font-medium">
                      <AlertCircle size={14} />
                      AI will automatically categorize your complaint based on the content.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : modalType === "create" ? "Submit Complaint" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </StudentLayout>
  );
}