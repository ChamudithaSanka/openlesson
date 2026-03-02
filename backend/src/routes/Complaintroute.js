import express from "express";
import {
  createComplaint,
  getMyComplaints,
  updateComplaint,
  deleteComplaint,
} from "../controllers/Complaintcontroller.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Complaint input validation middleware
const validateComplaint = [
  body("subject").notEmpty().withMessage("Subject is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("category")
    .optional()
    .isIn(["Login Issue", "Video/Content Issue", "Technical Bug", "Payment Issue", "Other"])
    .withMessage("Invalid category"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// Create complaint
router.post("/", validateComplaint, createComplaint);

// Get my complaints
router.get("/my-complaints", getMyComplaints);

// Update complaint
router.put("/:id", validateComplaint, updateComplaint);

// Delete complaint
router.delete("/:id", deleteComplaint);

export default router;