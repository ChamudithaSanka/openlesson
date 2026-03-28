import express from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.post("/", protect, authorize("admin"), createSubject);
router.put("/:id", protect, authorize("admin"), updateSubject);
router.delete("/:id", protect, authorize("admin"), deleteSubject);

export default router;
