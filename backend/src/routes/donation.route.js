import express from "express";
import {
  createDonation,
  completeDonation,
  getMyDonations,
  getAllDonations,
  getDonationById,
  updateDonationStatus,
  deleteDonation,
} from "../controllers/donation.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Donor routes
router.post("/", protect, authorize("donor"), createDonation);
router.put("/:id/complete", protect, authorize("donor"), completeDonation);
router.get("/my", protect, authorize("donor"), getMyDonations);

// Admin routes
router.get("/", protect, authorize("admin"), getAllDonations);
router.get("/:id", protect, authorize("admin"), getDonationById);
router.put("/:id", protect, authorize("admin"), updateDonationStatus);
router.delete("/:id", protect, authorize("admin"), deleteDonation);

export default router;
