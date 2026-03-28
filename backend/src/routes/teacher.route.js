import express from "express";
import {
  getTeacherProfile,
  getAllTeachers,
  getPendingTeachers,
  updateTeacherStatus,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllTeachers);

// Private routes
router.get("/pending", protect, authorize("admin"), getPendingTeachers);
router.put("/:id/status", protect, authorize("admin"), updateTeacherStatus);
router.get("/profile/:id", protect, getTeacherProfile);
router.put("/:id", protect, updateTeacher);
router.delete("/:id", protect, authorize("admin"), deleteTeacher);

export default router;
