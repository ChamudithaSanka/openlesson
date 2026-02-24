import express from "express";
import {
  createFeedback,
  getAllFeedback,
  getFeedbackByStudent,
  getFeedbackById,
  updateFeedback,
  deleteFeedback
} from "../controllers/feedbackController.js";

import { body, validationResult } from 'express-validator';

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



//feedback input Validation
const validateFeedback = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('teacherId').notEmpty().withMessage('Teacher ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be a number between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

router.post("/", validateFeedback, createFeedback);

export default router;