import express from "express";
import {
  getDonorProfile,
  updateDonorProfile,
  setDonorSubscription,
  toggleDonorSubscription,
  getAllDonors,
  getDonorForAdmin,
  updateDonorForAdmin,
  deleteDonor,
} from "../controllers/donor.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Private donor routes
router.get("/profile/:id", protect, getDonorProfile);
router.put("/profile/:id", protect, updateDonorProfile);
router.put("/subscription/:id", protect, authorize("donor", "admin"), setDonorSubscription);
router.patch("/subscription/:id/toggle", protect, authorize("donor", "admin"), toggleDonorSubscription);

// Admin routes
router.get("/", protect, authorize("admin"), getAllDonors);
router.get("/admin/:id", protect, authorize("admin"), getDonorForAdmin);
router.put("/admin/:id", protect, authorize("admin"), updateDonorForAdmin);
router.delete("/:id", protect, authorize("admin"), deleteDonor);

export default router;
