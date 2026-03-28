import express from "express";
import { register, login, getCurrentUser } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { uploadCv } from "../middleware/upload.js";

const router = express.Router();

// Public routes
router.post("/register", uploadCv.single("cv"), register);
router.post("/login", login);

// Private routes
router.get("/me", protect, getCurrentUser);

export default router;
