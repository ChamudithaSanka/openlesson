const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes
router.post("/", authMiddleware, reportController.createReport);
router.get("/my-reports", authMiddleware, reportController.getMyReports);
router.put("/:id", authMiddleware, reportController.updateReport);
router.delete("/:id", authMiddleware, reportController.deleteReport);

module.exports = router;