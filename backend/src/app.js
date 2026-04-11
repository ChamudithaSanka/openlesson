import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.route.js";
import studySessionRoutes from "./routes/studySession.route.js";
import announcementRoutes from "./routes/announcement.route.js";
import gradeRoutes from "./routes/grade.route.js";
import subjectRoutes from "./routes/subject.route.js";
import donorRoutes from "./routes/donor.route.js";
import donationRoutes from "./routes/donation.route.js";
import payhereRoutes from "./routes/payhere.route.js";
import teacherRoutes from "./routes/teacher.route.js";
import quizRoutes from "./routes/quiz.route.js";
import studyMaterialRoutes from "./routes/studyMaterial.route.js";
import studentRegRoutes from "./routes/studentRegRoute.js"; 
import feedbackRoutes from "./routes/feedbackRoute.js"; 
import reportRoutes from "./routes/Complaintroute.js";
import enrollmentRoutes from "./routes/enrollment.route.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// Auth routes
app.use("/api/auth", authRoutes);

// Routes
app.use("/api/students", studentRegRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/complaints", reportRoutes);
app.use("/api/study-sessions", studySessionRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/payments/payhere", payhereRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/study-materials", studyMaterialRoutes);

// Student-teacher enrollments
app.use("/api/enrollments", enrollmentRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

export default app;