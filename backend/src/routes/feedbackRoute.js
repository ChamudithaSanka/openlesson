import express from "express";
import {
  createFeedback,
  getAllFeedback,
  getFeedbackByStudent,
  getFeedbackById,
  updateFeedback,
  deleteFeedback
} from "../controllers/feedbackController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Get all feedback (for admin/testing)
router.get("/", protect, authorize("admin"), getAllFeedback);

// Get feedback by student
router.get("/student/:studentId", getFeedbackByStudent);

// Get feedback by ID
router.get("/:id", getFeedbackById);

// Update feedback
router.put("/:id", updateFeedback);

// Delete feedback
router.delete("/:id", protect, authorize("admin"), deleteFeedback);

router.post("/", protect, authorize("student"), createFeedback);

export default router;