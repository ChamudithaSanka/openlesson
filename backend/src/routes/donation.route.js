import express from "express";
import {
  createDonation,
  getMyDonations,
  getAllDonations,
  getDonationsByDonor,
  getDonationById,
  updateDonationStatus,
  deleteDonation,
} from "../controllers/donation.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Donor routes
router.post("/", protect, authorize("donor"), createDonation);
router.get("/my/:donorId", protect, authorize("donor"), getMyDonations);

// Admin routes
router.get("/", protect, authorize("admin"), getAllDonations);
router.get("/donor/:donorId", protect, authorize("admin"), getDonationsByDonor);
router.get("/:id", protect, authorize("admin"), getDonationById);
router.put("/:id", protect, authorize("admin"), updateDonationStatus);
// Allow both admin and donor to delete, but donor can only delete their own
router.delete("/:id", protect, authorize("admin", "donor"), deleteDonation);

export default router;
