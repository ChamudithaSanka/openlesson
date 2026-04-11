import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Clock, Search } from 'lucide-react';
import StudentLayout from '../../components/student/StudentLayout';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = ['Login Issue', 'Video/Content Issue', 'Technical Bug', 'Other'];

const statusColors = {
  Open: 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-amber-100 text-amber-800',
  Resolved: 'bg-green-100 text-green-800',
};

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ subject: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [fetchingComplaints, setFetchingComplaints] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('token');

  const fetchComplaints = useCallback(async () => {
    try {
      setFetchingComplaints(true);
      const res = await fetch(`${API}/api/complaints/my-complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingComplaints(false);
    }
  }, [token]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.subject.trim()) return setError('Subject is required.');
    if (!form.description.trim()) return setError('Description is required.');

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit complaint');
      setSuccess('Complaint submitted successfully!');
      setForm({ subject: '', description: '' });
      fetchComplaints();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    try {
      const res = await fetch(`${API}/api/complaints/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComplaints((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = complaints.filter((c) =>
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StudentLayout title="Complaints">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Complaints</h1>
          <p className="text-gray-500 mt-2">Report platform issues and track their resolution status.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-0 h-fit flex">
            {/* Accent bar */}
            <div className="hidden sm:block w-2 rounded-l-2xl bg-gradient-to-b from-red-500 via-orange-400 to-yellow-400" />
            <div className="flex-1 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" /> Submit a Complaint
              </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-2">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-bold">✨ AI Categorization:</span> Your complaint will be automatically categorized by our AI model based on your subject and description.
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="Brief title of your issue"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe the issue in detail..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition text-sm resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm">
                  <CheckCircle size={16} /> {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 hover:from-red-600 hover:via-orange-500 hover:to-yellow-500 text-white rounded-xl font-bold transition disabled:opacity-60 shadow-md"
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
            </div>
          </div>

          {/* Complaints List */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800">My Complaints</h2>
              {complaints.length > 0 && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {complaints.length}
                </span>
              )}
            </div>

            {complaints.length > 0 && (
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-400 transition text-sm"
                />
              </div>
            )}

            {fetchingComplaints ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                <AlertTriangle size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">
                  {complaints.length === 0 ? 'No complaints submitted yet' : 'No matching complaints'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((c) => (
                  <div key={c._id} className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-300 relative ${
                    c.status === 'Resolved' ? 'border-l-4 border-green-400' : c.status === 'Under Review' ? 'border-l-4 border-amber-400' : 'border-l-4 border-blue-400'
                  }`}>
                    <div className="flex items-start justify-between mb-2 w-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-800 text-sm break-words">{c.subject}</h3>
                          {/* Status badge */}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm ${
                            c.status === 'Resolved'
                              ? 'bg-green-100 text-green-700 border border-green-200 flex items-center gap-1'
                              : c.status === 'Under Review'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1'
                              : 'bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1'
                          }`}>
                            {c.status === 'Resolved' ? <CheckCircle size={12} /> : <Clock size={12} />} {c.status}
                          </span>
                          {/* Category badge */}
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                            {c.category}
                          </span>
                          {/* Priority badge */}
                          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                            {c.priority}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(c.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      </div>
                      {c.status === 'Open' && (
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-red-400 hover:text-red-600 text-xs ml-3 transition font-semibold whitespace-nowrap"
                          style={{ alignSelf: 'flex-start' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mt-1">{c.description}</p>
                    {c.adminNote && (
                      <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
                        <span className="font-semibold">Admin Note:</span> {c.adminNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentComplaints;