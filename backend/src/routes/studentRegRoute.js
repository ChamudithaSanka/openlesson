import express from 'express';
import {
  getStudentProfile,
  getMyProfile,
  updateMyProfile,
  updateProfile,
  getAllStudentsAdmin,
  getStudentDetailAdmin,
  updateStudentStatus,
  updateStudentAdmin,
  deleteStudent,
  uploadPicture
} from '../controllers/studentRegController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadProfilePicture } from '../middleware/upload.js';

const router = express.Router();

// Private routes (student - own profile only)
router.get('/my-profile', protect, getMyProfile);
router.put('/my-profile', protect, updateMyProfile);
router.put('/upload-picture', protect, uploadProfilePicture.single('profilePicture'), uploadPicture);
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