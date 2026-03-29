import Complaint from "../models/ComplaintModel.js";
import { categorizeComplaint } from "../utils/aiCategoryService.js"; // 👈 import AI service

// 🔹 Create Complaint (with AI auto-categorization)
export const createComplaint = async (req, res) => {
  try {
    const { studentId, subject, description, category } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        message: "Subject and description are required",
      });
    }

    // 🤖 If the student didn't pick a category, let AI decide
    let resolvedCategory = category;
    if (!category || category === "Other") {
      resolvedCategory = await categorizeComplaint(subject, description);
    }

    const newComplaint = new Complaint({
      studentId,
      subject,
      description,
      category: resolvedCategory,
    });

    await newComplaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully",
      aiCategorized: !category || category === "Other", // tells frontend if AI was used
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
    const { studentId } = req.params;

    const complaints = await Complaint.find({ studentId }).sort({ createdAt: -1 });

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

    // Only allow updates if complaint is still Open
    if (complaint.status !== "Open") {
      return res.status(400).json({
        message: "Complaint can only be edited while it is Open",
      });
    }

    if (subject) complaint.subject = subject;
    if (description) complaint.description = description;

    // 🤖 If description changed and no new category given, re-run AI categorization
    if (description && !category) {
      complaint.category = await categorizeComplaint(
        subject || complaint.subject,
        description
      );
    } else if (category) {
      complaint.category = category;
    }

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
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
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