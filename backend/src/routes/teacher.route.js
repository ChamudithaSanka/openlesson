import express from "express";
import {
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
} from "../controllers/teacher.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllTeachers);

// Private routes (admin only)
router.post("/", protect, authorize("admin"), createTeacher);
router.get("/pending", protect, authorize("admin"), getPendingTeachers);
router.put("/:id/status", protect, authorize("admin"), updateTeacherStatus);
router.get("/profile/:id", protect, getTeacherProfile);
router.put("/:id", protect, updateTeacher);
router.delete("/:id", protect, authorize("admin"), deleteTeacher);

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
