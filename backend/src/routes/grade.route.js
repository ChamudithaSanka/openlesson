import express from "express";
import {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../controllers/grade.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAllGrades);
router.get("/:id", getGradeById);
router.post("/", protect, authorize("admin"), createGrade);
router.put("/:id", protect, authorize("admin"), updateGrade);
router.delete("/:id", protect, authorize("admin"), deleteGrade);

export default router;
