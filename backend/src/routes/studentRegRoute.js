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


//student registration input validation
const validateStudentRegistration = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('gradeId').notEmpty().withMessage('Grade ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

router.post('/register', validateStudentRegistration, registerStudent);



export default router;