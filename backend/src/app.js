import express from "express";
import cors from "cors";
import studySessionRoutes from "./routes/studySession.route.js";
import announcementRoutes from "./routes/announcement.route.js";
import gradeRoutes from "./routes/grade.route.js";
import subjectRoutes from "./routes/subject.route.js";
import donorRoutes from "./routes/donor.route.js";
import donationRoutes from "./routes/donation.route.js";
import teacherRoutes from "./routes/teacher.route.js";

import studentRegRoutes from "./routes/studentRegRoute.js"; 
import feedbackRoutes from "./routes/feedbackRoute.js"; 
import reportRoutes from "./routes/Complaintroute.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes will be added here
app.use("/api/students", studentRegRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/complaints", reportRoutes);

// Routes
app.use("/api/study-sessions", studySessionRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/teachers", teacherRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

export default app;
