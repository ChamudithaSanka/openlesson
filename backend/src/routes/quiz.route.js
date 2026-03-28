// Quiz Routes - Maps URLs to controller functions

import express from "express";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quiz.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// CREATE - POST /api/quizzes
router.post("/", protect, authorize("teacher", "admin"), createQuiz);

// READ - GET /api/quizzes
router.get("/", getAllQuizzes);

// READ - GET /api/quizzes/:id
router.get("/:id", getQuizById);

// UPDATE - PUT /api/quizzes/:id
router.put("/:id", protect, authorize("teacher", "admin"), updateQuiz);

// DELETE - DELETE /api/quizzes/:id
router.delete("/:id", protect, authorize("teacher", "admin"), deleteQuiz);

export default router;
