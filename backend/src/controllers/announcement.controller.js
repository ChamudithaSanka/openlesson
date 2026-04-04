import Announcement from "../models/announcement.model.js";

// GET /api/announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description");
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/announcements/:id
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description");
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/announcements
export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description");
    res.status(201).json({ success: true, data: populatedAnnouncement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/announcements/:id
export const updateAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
    });
    const populatedAnnouncement = await Announcement.findById(req.params.id)
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description");
    if (!populatedAnnouncement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.status(200).json({ success: true, data: populatedAnnouncement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/announcements/:id
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.status(200).json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
