import express from "express";

// Import study session controller functions
import {
  getAllStudySessions,
  getStudySessionsPublic,
  getStudySessionById,
  createStudySession,
  updateStudySession,
  deleteStudySession,
} from "../controllers/studySession.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// GET all study sessions (public - for students to view sessions from enrolled teachers)
router.get("/public/all", getStudySessionsPublic);

// GET all study sessions for logged-in teacher
router.get("/", protect, authorize("teacher", "admin"), getAllStudySessions);

// GET a single study session by ID
router.get("/:id", getStudySessionById);

// POST - create a new study session
router.post("/", protect, authorize("teacher", "admin"), createStudySession);

// PUT - update an existing study session by ID
router.put("/:id", protect, authorize("teacher", "admin"), updateStudySession);

// DELETE - remove a study session by ID
router.delete("/:id", protect, authorize("teacher", "admin"), deleteStudySession);

export default router;
