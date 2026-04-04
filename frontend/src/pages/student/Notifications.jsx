import { useEffect, useState } from "react";
import StudentLayout from "../../components/student/Studentlayout";
import { Bell, CheckCircle, Info, AlertTriangle, Megaphone, Trash2 } from "lucide-react";

// Notification type config
const TYPE_CONFIG = {
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  success: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 border-green-200", dot: "bg-green-500" },
  warning: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-500" },
  announcement: { icon: Megaphone, color: "text-purple-600", bg: "bg-purple-50 border-purple-200", dot: "bg-purple-500" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unread" | "read"

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notifications/my-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      } else {
        // Fallback: show sample notifications if endpoint not set up
        setNotifications([
          {
            _id: "sample-1",
            title: "Welcome to OpenLesson!",
            message: "Your account has been set up successfully. Start exploring your dashboard.",
            type: "success",
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "sample-2",
            title: "New Study Session Available",
            message: "A Grade 10 Mathematics live session has been scheduled for Tuesday at 6:00 PM.",
            type: "announcement",
            isRead: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            _id: "sample-3",
            title: "Complaint Update",
            message: "Your complaint regarding 'Login Issue' has been reviewed by the admin.",
            type: "info",
            isRead: true,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ]);
      }
    } catch {
      // Show sample notifications on error
      setNotifications([
        {
          _id: "sample-1",
          title: "Welcome to OpenLesson!",
          message: "Your account has been set up successfully.",
          type: "success",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch {
      // Update locally even if API fails
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setNotifications(notifications.filter((n) => n._id !== notificationId));
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <StudentLayout title="Notifications" subtitle="Stay updated with announcements from admins and teachers">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header Actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {["all", "unread", "read"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                filter === f
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Bell className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter === "unread" ? "You're all caught up!" : "No notifications to show."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification) => {
              const typeKey = notification.type || "info";
              const config = TYPE_CONFIG[typeKey] || TYPE_CONFIG.info;
              const Icon = config.icon;

              return (
                <div
                  key={notification._id}
                  className={`rounded-2xl border p-4 transition ${
                    notification.isRead
                      ? "bg-white border-gray-200"
                      : `${config.bg}`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <div className="flex-shrink-0 mt-1 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.isRead ? "bg-gray-100" : config.bg
                      }`}>
                        <Icon size={16} className={notification.isRead ? "text-gray-400" : config.color} />
                      </div>
                      {!notification.isRead && (
                        <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${config.dot}`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-semibold text-sm ${notification.isRead ? "text-gray-600" : "text-gray-800"}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm mt-0.5 leading-relaxed ${notification.isRead ? "text-gray-400" : "text-gray-600"}`}>
                        {notification.message}
                      </p>

                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className={`mt-2 text-xs font-semibold ${config.color} hover:underline transition`}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}