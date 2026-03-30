import Complaint from "../models/Complaintmodel.js";
import Student from "../models/studentRegModel.js";

// 🔹 Create Complaint
export const createComplaint = async (req, res) => {
  try {
    const { subject, description, category } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        message: "Subject and description are required",
      });
    }

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(403).json({ message: "Only students can create complaints" });
    }

    const newComplaint = new Complaint({
      studentId: student._id,
      subject,
      description,
      category: category || "Other",
    });

    await newComplaint.save();

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
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(403).json({ message: "Only students can view complaints" });
    }

    const complaints = await Complaint.find({ studentId: student._id }).sort({ createdAt: -1 });

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

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(403).json({ message: "Only students can update complaints" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.studentId.toString() !== student._id.toString()) {
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
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(403).json({ message: "Only students can delete complaints" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.studentId.toString() !== student._id.toString()) {
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

// ============ ADMIN ENDPOINTS ============

// 🔹 Get All Complaints (Admin Only)
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate({
        path: "studentId",
        select: "fullName email phone schoolName",
        populate: { path: "userId", select: "email" }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// 🔹 Get Single Complaint (Admin Only)
export const getComplaintDetail = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate({
        path: "studentId",
        select: "fullName email phone schoolName district",
        populate: { path: "userId", select: "email" }
      });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// 🔹 Update Complaint Status (Admin Only)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Open", "Under Review", "Resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be Open, Under Review, or Resolved"
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate({
        path: "studentId",
        select: "fullName email phone schoolName"
      });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.status(200).json({
      success: true,
      message: "Complaint status updated",
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// 🔹 Add Admin Note (Admin Only)
export const addAdminNote = async (req, res) => {
  try {
    const { adminNote } = req.body;

    if (!adminNote) {
      return res.status(400).json({
        success: false,
        message: "Admin note is required"
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { adminNote },
      { new: true }
    )
      .populate({
        path: "studentId",
        select: "fullName email phone schoolName"
      });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.status(200).json({
      success: true,
      message: "Admin note added",
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};