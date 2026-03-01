import express from "express";
import {
  getAllStudySessions,
  getStudySessionById,
  createStudySession,
  updateStudySession,
  deleteStudySession,
} from "../controllers/studySession.controller.js";

const router = express.Router();

router.get("/", getAllStudySessions);
router.get("/:id", getStudySessionById);
router.post("/", createStudySession);
router.put("/:id", updateStudySession);
router.delete("/:id", deleteStudySession);

export default router;
