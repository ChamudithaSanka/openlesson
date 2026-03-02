import express from "express";
import {
  createStudyMaterial,
  getAllStudyMaterials,
  getStudyMaterialById,
  updateStudyMaterial,
  deleteStudyMaterial,
} from "../controllers/studyMaterial.controller.js";

const router = express.Router();

// Simple CRUD routes - no authentication
router.post("/", createStudyMaterial);
router.get("/", getAllStudyMaterials);
router.get("/:id", getStudyMaterialById);
router.put("/:id", updateStudyMaterial);
router.delete("/:id", deleteStudyMaterial);

export default router;
