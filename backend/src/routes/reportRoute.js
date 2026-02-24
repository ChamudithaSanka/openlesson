import express from "express";
import { createReport, 
    getMyReports, 
    updateReport, 
    deleteReport } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";

import { body, validationResult } from 'express-validator';


const router = express.Router();

//create report
router.post("/", protect, createReport);

//get my reports
router.get("/my-reports", protect, getMyReports);

//update report
router.put("/:id", protect, updateReport);

//delete report
router.delete("/:id", protect, deleteReport);


//report input Validation
const validateReport = [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('description').notEmpty().withMessage('Description is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

router.post("/", protect, validateReport, createReport);

export default router;