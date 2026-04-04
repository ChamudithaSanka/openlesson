import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import TeacherLayout from '../components/TeacherLayout';

const TeacherAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAddAnnouncement = () => {
    if (title.trim() && description.trim()) {
      const newAnnouncement = {
        id: Date.now(),
        title,
        description,
        createdAt: new Date().toLocaleDateString(),
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      setTitle('');
      setDescription('');
    }
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(announcement => announcement.id !== id));
  };

  return (
    <TeacherLayout>
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Announcements</h1>

          {/* Add Announcement Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Create New Announcement</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Announcement Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Announcement Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddAnnouncement}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
                Post Announcement
              </button>
            </div>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No announcements yet. Create one to get started!</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{announcement.title}</h3>
                      <p className="text-gray-600 mt-2">{announcement.description}</p>
                      <p className="text-sm text-gray-400 mt-4">Posted on {announcement.createdAt}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherAnnouncements;
