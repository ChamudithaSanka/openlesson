import Complaint from "../models/ComplaintModel.js";
import Notification from "../models/studentNotificationModel.js";

// 🔹 Create Complaint
export const createComplaint = async (req, res) => {
  try {
    const { subject, description, category } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        message: "Subject and description are required",
      });
    }

    const newComplaint = new Complaint({
      studentId: req.user.id,
      subject,
      description,
      category: category || "Other",
    });

    await newComplaint.save();

    // Create notification for student
    await Notification.create({
      studentId: req.user.id,
      type: "Report",
      message: `Your complaint about "${subject}" has been submitted successfully. We'll look into it shortly.`,
    });

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: newComplaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 🔹 Get Logged-in Student's Complaints
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      studentId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 🔹 Update Complaint
export const updateComplaint = async (req, res) => {
  try {
    const { subject, description, category } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    // Only allow updates if complaint is still Open
    if (complaint.status !== "Open") {
      return res.status(400).json({
        message: "Complaint can only be edited while it is Open",
      });
    }

    if (subject) complaint.subject = subject;
    if (description) complaint.description = description;
    if (category) complaint.category = category;

    await complaint.save();

    // Notify student about the update
    await Notification.create({
      studentId: complaint.studentId,
      type: "Report",
      message: `Your complaint about "${complaint.subject}" has been updated successfully.`,
    });

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 🔹 Delete Complaint
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await complaint.deleteOne();

    res.status(200).json({
      message: "Complaint deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};