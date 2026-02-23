import express from "express";
import {
  createFeedback,
  getAllFeedback,
  getFeedbackByStudent,
  getFeedbackById,
  updateFeedback,
  deleteFeedback
} from "../controllers/feedbackController.js";

const router = express.Router();

// Create feedback
router.post("/", createFeedback);

// Get all feedback (for admin/testing)
router.get("/", getAllFeedback);

// Get feedback by student
router.get("/student/:studentId", getFeedbackByStudent);

// Get feedback by ID
router.get("/:id", getFeedbackById);

// Update feedback
router.put("/:id", updateFeedback);

// Delete feedback
router.delete("/:id", deleteFeedback);

export default router;