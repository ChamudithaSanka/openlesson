import express from "express";
import {
  getDonorProfile,
  updateDonorProfile,
  getAllDonors,
  updateDonorStatus,
  deleteDonor,
} from "../controllers/donor.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Private donor routes
router.get("/profile/:id", protect, getDonorProfile);
router.put("/profile/:id", protect, updateDonorProfile);

// Admin routes
router.get("/", protect, getAllDonors);
router.put("/:id/status", protect, updateDonorStatus);
router.delete("/:id", protect, deleteDonor);

export default router;
