import express from "express";
import {
  createComplaint,
  getMyComplaints,
  updateComplaint,
  deleteComplaint,
  getAllComplaints,
  getComplaintDetail,
  updateComplaintStatus,
  addAdminNote,
} from "../controllers/Complaintcontroller.js";
import { protect, authorize } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Complaint input validation middleware
const validateComplaint = [
  body("subject").notEmpty().withMessage("Subject is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("category")
    .optional()
    .isIn(["Login Issue", "Video/Content Issue", "Technical Bug", "Other"])
    .withMessage("Invalid category"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// Create complaint
router.post("/", protect, authorize("student"), validateComplaint, createComplaint);

// Get my complaints
router.get("/my-complaints", protect, authorize("student"), getMyComplaints);

// Update complaint
router.put("/:id", protect, authorize("student"), validateComplaint, updateComplaint);

// Delete complaint
router.delete("/:id", protect, authorize("student"), deleteComplaint);

// ============ ADMIN ROUTES ============

// Get all complaints (admin)
router.get("/admin/all", protect, authorize("admin"), getAllComplaints);

// Get single complaint detail (admin)
router.get("/admin/:id", protect, authorize("admin"), getComplaintDetail);

// Update complaint status (admin)
router.put("/admin/:id/status", protect, authorize("admin"), updateComplaintStatus);

// Add admin note (admin)
router.put("/admin/:id/note", protect, authorize("admin"), addAdminNote);

export default router;