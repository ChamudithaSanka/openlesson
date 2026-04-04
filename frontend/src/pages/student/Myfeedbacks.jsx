import { useEffect, useState } from "react";
import StudentLayout from "../../components/student/Studentlayout";
import { Star, Edit2, Trash2, X, MessageSquare, Plus } from "lucide-react";

function StarRating({ value, onChange, readonly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={readonly ? "button" : "button"}
          onClick={() => !readonly && onChange && onChange(star)}
          className={`transition ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <Star
            size={20}
            className={star <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        </button>
      ))}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        {children}
      </div>
    </div>
  );
}

export default function MyFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // "create" | "edit"
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({ teacherId: "", rating: 5, comment: "" });

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get student profile to find grade
      const profileRes = await fetch(`${API_URL}/api/students/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      const studentId = profileData.student?._id;
      const gradeId = profileData.student?.gradeId?._id || profileData.student?.gradeId;

      // Fetch feedbacks given by student
      if (studentId) {
        const feedbackRes = await fetch(`${API_URL}/api/feedback/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (feedbackRes.ok) {
          const data = await feedbackRes.json();
          setFeedbacks(data.feedbacks || []);
        }
      }

      // Fetch teachers for the dropdown
      if (gradeId) {
        const teachersRes = await fetch(`${API_URL}/api/teachers/by-grade/${gradeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (teachersRes.ok) {
          const data = await teachersRes.json();
          setTeachers(data.teachers || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({ teacherId: teachers[0]?._id || "", rating: 5, comment: "" });
    setMessage("");
    setError("");
    setModalType("create");
    setShowModal(true);
  };

  const openEdit = (feedback) => {
    setSelected(feedback);
    setForm({
      teacherId: feedback.teacherId?._id || feedback.teacherId,
      rating: feedback.rating,
      comment: feedback.comment,
    });
    setMessage("");
    setError("");
    setModalType("edit");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) {
      setError("Comment is required.");
      return;
    }
    if (!form.teacherId) {
      setError("Please select a teacher.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const isEdit = modalType === "edit";
      const res = await fetch(
        isEdit
          ? `${API_URL}/api/feedback/${selected._id}`
          : `${API_URL}/api/feedback`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacherId: form.teacherId,
            rating: form.rating,
            comment: form.comment,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMessage(isEdit ? "Feedback updated!" : "Feedback submitted!");
        fetchData();
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

  const handleDelete = async (feedback) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      const res = await fetch(`${API_URL}/api/feedback/${feedback._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setFeedbacks(feedbacks.filter((f) => f._id !== feedback._id));
      } else {
        alert("Failed to delete feedback.");
      }
    } catch {
      alert("Server error.");
    }
  };

  const averageRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
      : null;

  return (
    <StudentLayout title="My Feedbacks" subtitle="Manage feedback you've given to teachers">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm">
              <span className="text-gray-500">Total given: </span>
              <span className="font-bold text-gray-800">{feedbacks.length}</span>
            </div>
            {averageRating && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-sm flex items-center gap-1.5">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-yellow-700">{averageRating} avg</span>
              </div>
            )}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
          >
            <Plus size={16} />
            Give Feedback
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading feedbacks...</div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No feedbacks yet</p>
            <p className="text-gray-400 text-sm mt-1">Share your experience with your teachers.</p>
            <button
              onClick={openCreate}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
            >
              Give First Feedback
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-800">
                        {feedback.teacherId?.fullName || "Teacher"}
                      </p>
                      {feedback.teacherId?.qualification && (
                        <span className="text-xs text-blue-600 font-medium">
                          {feedback.teacherId.qualification}
                        </span>
                      )}
                    </div>
                    <StarRating value={feedback.rating} readonly />
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{feedback.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(feedback)}
                      className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(feedback)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">
                {modalType === "create" ? "Give Feedback" : "Edit Feedback"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
                <select
                  value={form.teacherId}
                  onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                  disabled={modalType === "edit"}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName} {t.qualification ? `(${t.qualification})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                <StarRating value={form.rating} onChange={(val) => setForm({ ...form, rating: val })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Share your experience with this teacher..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60"
              >
                {submitting ? "Saving..." : modalType === "create" ? "Submit Feedback" : "Update Feedback"}
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
        </Modal>
      )}
    </StudentLayout>
  );
}