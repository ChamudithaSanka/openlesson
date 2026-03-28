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
router.get("/", protect, authorize("admin"), getAllDonors);
router.put("/:id/status", protect, authorize("admin"), updateDonorStatus);
router.delete("/:id", protect, authorize("admin"), deleteDonor);

export default router;
