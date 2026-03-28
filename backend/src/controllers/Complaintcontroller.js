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