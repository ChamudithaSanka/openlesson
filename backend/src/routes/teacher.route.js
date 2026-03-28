import express from "express";
import {
  getTeacherProfile,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllTeachers);

// Private routes
router.get("/profile/:id", protect, getTeacherProfile);
router.put("/:id", protect, updateTeacher);
router.delete("/:id", protect, deleteTeacher);

export default router;
