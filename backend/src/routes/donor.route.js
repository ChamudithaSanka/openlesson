import express from "express";
import {
  registerDonor,
  loginDonor,
  getDonorProfile,
  updateDonorProfile,
  getAllDonors,
  updateDonorStatus,
  deleteDonor,
} from "../controllers/donor.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerDonor);
router.post("/login", loginDonor);

// Donor private routes
router.get("/profile", protect, authorize("donor"), getDonorProfile);
router.put("/profile", protect, authorize("donor"), updateDonorProfile);

// Admin only routes
router.get("/", protect, authorize("admin"), getAllDonors);
router.put("/:id/status", protect, authorize("admin"), updateDonorStatus);
router.delete("/:id", protect, authorize("admin"), deleteDonor);

export default router;
