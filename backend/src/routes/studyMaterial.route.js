import express from "express";
import {
  createStudyMaterial,
  getAllStudyMaterials,
  getStudyMaterialById,
  updateStudyMaterial,
  deleteStudyMaterial,
} from "../controllers/studyMaterial.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Simple CRUD routes - no authentication
router.post("/", protect, authorize("teacher", "admin"), createStudyMaterial);
router.get("/", getAllStudyMaterials);
router.get("/:id", getStudyMaterialById);
router.put("/:id", protect, authorize("teacher", "admin"), updateStudyMaterial);
router.delete("/:id", protect, authorize("teacher", "admin"), deleteStudyMaterial);

export default router;
