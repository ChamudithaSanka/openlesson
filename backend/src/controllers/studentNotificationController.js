import Notification from "../models/notificationModel.js";

// Get all notifications for a student
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};