import express from 'express';
import { enrollTeacher, getMyEnrolledTeachers, unenrollTeacher } from '../controllers/enrollment.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student enrolls in a teacher
router.post('/', protect, authorize('student'), enrollTeacher);

// Student unenrolls from a teacher
router.delete('/:teacherId', protect, authorize('student'), unenrollTeacher);

// Get all teachers the student is enrolled in
router.get('/my-teachers', protect, authorize('student'), getMyEnrolledTeachers);

export default router;
