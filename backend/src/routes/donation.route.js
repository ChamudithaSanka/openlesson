import express from "express";
import {
  createDonation,
  getMyDonations,
  getAllDonations,
  getDonationById,
  updateDonationStatus,
  deleteDonation,
} from "../controllers/donation.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Donor routes
router.post("/", createDonation);
router.get("/my", getMyDonations);

// Admin routes
router.get("/", getAllDonations);
router.get("/:id", getDonationById);
router.put("/:id", updateDonationStatus);
router.delete("/:id", deleteDonation);

export default router;
