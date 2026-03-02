// Quiz Routes - Maps URLs to controller functions

import express from "express";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quiz.controller.js";

const router = express.Router();

// CREATE - POST /api/quizzes
router.post("/", createQuiz);

// READ - GET /api/quizzes
router.get("/", getAllQuizzes);

// READ - GET /api/quizzes/:id
router.get("/:id", getQuizById);

// UPDATE - PUT /api/quizzes/:id
router.put("/:id", updateQuiz);

// DELETE - DELETE /api/quizzes/:id
router.delete("/:id", deleteQuiz);

export default router;
