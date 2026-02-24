import Feedback from "../models/feedbackModel.js";
import Teacher from "../models/teacherModel.js";

// CREATE feedback
export const createFeedback = async (req, res) => {
  try {
    const { studentId, teacherId, rating, comment } = req.body;

    const feedback = new Feedback({ studentId, teacherId, rating, comment });
    await feedback.save();


      //notification for feedback submitted
    await Notification.create({
    studentId: feedback.studentId,
    type: "Feedback",
    message: `Your feedback for the teacher has been submitted successfully.`,
    });


    
    res.status(201).json({ message: "Feedback created successfully", feedback });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// READ all feedback (for testing / admin view)
export const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("studentId", "fullName email")
      .populate("teacherId", "fullName qualification");
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// READ feedback by ID
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate("studentId", "fullName email")
      .populate("teacherId", "fullName qualification");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// READ feedback for a specific student
export const getFeedbackByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const feedbacks = await Feedback.find({ studentId })
      .populate("teacherId", "fullName qualification");
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// UPDATE feedback (student can update their own feedback)
export const updateFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const updates = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(feedbackId, updates, { new: true });
    res.json({ message: "Feedback updated", feedback: updatedFeedback });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE feedback
export const deleteFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    await Feedback.findByIdAndDelete(feedbackId);
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};