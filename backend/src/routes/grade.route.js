import express from "express";
import {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../controllers/grade.controller.js";

const router = express.Router();

router.get("/", getAllGrades);
router.get("/:id", getGradeById);
router.post("/", createGrade);
router.put("/:id", updateGrade);
router.delete("/:id", deleteGrade);

export default router;
