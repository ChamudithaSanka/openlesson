import express from "express";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quiz.controller.js";

const router = express.Router();

// Simple CRUD routes - no authentication
router.post("/", createQuiz);
router.get("/", getAllQuizzes);
router.get("/:id", getQuizById);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

export default router;
