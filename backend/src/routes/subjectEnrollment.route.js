import express from 'express';
import { enrollSubject, getMyEnrolledSubjects, unenrollSubject } from '../controllers/subjectEnrollment.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Student enrolls in a subject
router.post('/', protect, authorize('student'), enrollSubject);

// Get all subjects the student is enrolled in
router.get('/my-subjects', protect, authorize('student'), getMyEnrolledSubjects);

// Student unenrolls from a subject
router.delete('/:subjectId', protect, authorize('student'), unenrollSubject);

export default router;
