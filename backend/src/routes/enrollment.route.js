import express from 'express';
import { enrollTeacher, getMyEnrolledTeachers } from '../controllers/enrollment.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student enrolls in a teacher
router.post('/', protect, authorize('student'), enrollTeacher);

// Get all teachers the student is enrolled in
router.get('/my-teachers', protect, authorize('student'), getMyEnrolledTeachers);

export default router;
