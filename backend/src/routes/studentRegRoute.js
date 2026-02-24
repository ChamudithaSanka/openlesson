import express from 'express';
import {
  registerStudent,
  loginStudent,
  updateProfile,
  deactivateStudent
} from '../controllers/studentRegController.js';

import { body, validationResult } from 'express-validator';


const router = express.Router();

//register students
router.post('/register', registerStudent);

//student login
router.post('/login', loginStudent);

//update profile details
router.put('/profile/:id', updateProfile);

//deactivate the account of the student
router.put('/deactivate/:id', deactivateStudent);

export default router;