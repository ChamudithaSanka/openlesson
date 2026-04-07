import express from 'express';
import {
  getStudentProfile,
  updateProfile,
  getAllStudentsAdmin,
  getStudentDetailAdmin,
  updateStudentStatus,
  updateStudentAdmin,
  deleteStudent
} from '../controllers/studentRegController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Private routes (student - own profile only)
router.get('/profile/:id', protect, getStudentProfile);
router.put('/profile/:id', protect, updateProfile);

// ============ ADMIN ROUTES ============

// Get all students (admin)
router.get('/admin/all', protect, authorize('admin'), getAllStudentsAdmin);

// Get single student detail (admin)
router.get('/admin/:id', protect, authorize('admin'), getStudentDetailAdmin);

// Update student status (admin)
router.put('/admin/:id/status', protect, authorize('admin'), updateStudentStatus);

// Update student details (admin)
router.put('/admin/:id', protect, authorize('admin'), updateStudentAdmin);

// Delete student (admin)
router.delete('/admin/:id', protect, authorize('admin'), deleteStudent);

export default router;