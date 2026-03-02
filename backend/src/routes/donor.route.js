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

// Donor routes
router.get("/profile/:id", getDonorProfile);
router.put("/profile/:id", updateDonorProfile);

// Admin routes
router.get("/", getAllDonors);
router.put("/:id/status", updateDonorStatus);
router.delete("/:id", deleteDonor);

export default router;
