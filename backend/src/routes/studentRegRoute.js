import express from 'express';
import {
  getStudentProfile,
  updateProfile
} from '../controllers/studentRegController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get student profile
router.get('/profile/:id', protect, getStudentProfile);

// Update student profile
router.put('/profile/:id', protect, updateProfile);

export default router;