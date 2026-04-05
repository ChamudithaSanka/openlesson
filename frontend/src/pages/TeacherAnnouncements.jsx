import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader, Calendar, Clock, Search } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

const TeacherAnnouncements = () => {
  const [adminAnnouncements, setAdminAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = 'http://localhost:5000';

  // Fetch announcements from backend
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/announcements`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Filter announcements for teacher role with Active status
        const filtered = data.data.filter(
          (announcement) =>
            announcement.status === 'Active' &&
            (announcement.targetRole === 'teacher' || 
             announcement.targetRole === 'all' ||
             announcement.targetRole === 'Teachers')
        );

        setAdminAnnouncements(filtered);
      }
    } catch (err) {
      setError(err.message || 'Error fetching announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);

      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      const weeks = Math.floor(days / 7);
      if (weeks < 4) return `${weeks}w ago`;
      return formatDate(dateString);
    } catch {
      return 'Unknown date';
    }
  };

  // Filter announcements based on search term
  const filteredAnnouncements = adminAnnouncements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <TeacherLayout>
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-800">Announcements</h1>
            </div>
            <p className="text-gray-600 ml-0">Stay updated with the latest announcements from the administration</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader size={40} className="animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Loading announcements...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <h3 className="font-semibold text-red-800">Error Loading Announcements</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Announcements List */}
          {!loading && (
            <>
              {/* Announcement Count */}
              {adminAnnouncements.length > 0 && (
                <div className="mb-6 text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-800">{filteredAnnouncements.length}</span> of <span className="font-semibold text-gray-800">{adminAnnouncements.length}</span> announcements
                </div>
              )}

              {/* Announcements Grid */}
              {filteredAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {filteredAnnouncements.map((announcement) => (
                    <div
                      key={announcement._id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-300 overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">{announcement.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar size={16} className="text-blue-600" />
                                <span>{formatDate(announcement.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={16} className="text-blue-600" />
                                <span>{getRelativeTime(announcement.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{announcement.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                  <p className="text-gray-600 text-lg font-medium mb-2">
                    {searchTerm ? 'No announcements found' : 'No announcements available'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {searchTerm ? 'Try adjusting your search terms' : 'Check back later for updates from the administration'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherAnnouncements;
