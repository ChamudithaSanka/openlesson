import express from "express";
import { createReport, 
    getMyReports, 
    updateReport, 
    deleteReport } from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createReport);
router.get("/my-reports", protect, getMyReports);
router.put("/:id", protect, updateReport);
router.delete("/:id", protect, deleteReport);

export default router;