import express from "express";
import {
  getMyTeacherProfile,
  getTeacherProfile,
  getAllTeachers,
  getPendingTeachers,
  createTeacher,
  updateTeacherStatus,
  updateTeacher,
  deleteTeacher,
  getAllTeachersAdmin,
  getTeacherDetailAdmin,
  approveTeacher,
  rejectTeacher,
  getTeacherCV,
} from "../controllers/teacher.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllTeachers);

// Private routes (teacher and admin)
router.get("/my-profile", protect, getMyTeacherProfile);
router.get("/profile/:id", protect, getTeacherProfile);

// Private routes (admin only)
router.post("/", protect, authorize("admin"), createTeacher);
router.get("/pending", protect, authorize("admin"), getPendingTeachers);
router.put("/:id/status", protect, authorize("admin"), updateTeacherStatus);
router.put("/:id", protect, updateTeacher);
router.delete("/:id", protect, authorize("admin"), deleteTeacher);

// Get teacher CV (download from database)
router.get("/:id/cv", protect, getTeacherCV);

// ============ ADMIN ROUTES ============

// Get all teachers (admin)
router.get("/admin/all", protect, authorize("admin"), getAllTeachersAdmin);

// Get single teacher detail (admin)
router.get("/admin/:id", protect, authorize("admin"), getTeacherDetailAdmin);

// Approve teacher (admin)
router.put("/admin/:id/approve", protect, authorize("admin"), approveTeacher);

// Reject teacher (admin)
router.put("/admin/:id/reject", protect, authorize("admin"), rejectTeacher);

export default router;
