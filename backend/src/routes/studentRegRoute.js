import express from 'express';
import {
  registerStudent,
  loginStudent,
  updateProfile,
  deactivateStudent
} from '../controllers/studentRegController.js';

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.put('/profile/:id', updateProfile);
router.put('/deactivate/:id', deactivateStudent);

export default router;