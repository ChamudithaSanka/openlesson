import express from "express";

// Import study session controller functions
import {
  getAllStudySessions,
  getStudySessionById,
  createStudySession,
  updateStudySession,
  deleteStudySession,
} from "../controllers/studySession.controller.js";

const router = express.Router();

// GET all study sessions
router.get("/", getAllStudySessions);

// GET a single study session by ID
router.get("/:id", getStudySessionById);

// POST - create a new study session
router.post("/", createStudySession);

// PUT - update an existing study session by ID
router.put("/:id", updateStudySession);

// DELETE - remove a study session by ID
router.delete("/:id", deleteStudySession);

export default router;
