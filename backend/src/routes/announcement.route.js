import express from "express";
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllAnnouncements);
router.get("/:id", getAnnouncementById);
router.post("/", protect, authorize("admin"), createAnnouncement);
router.put("/:id", protect, authorize("admin"), updateAnnouncement);
router.delete("/:id", protect, authorize("admin"), deleteAnnouncement);

export default router;
