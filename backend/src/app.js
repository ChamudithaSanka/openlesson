import express from "express";
import cors from "cors";

import studentRegRoutes from "./routes/studentRegRoute.js"; 
import feedbackRoutes from "./routes/feedbackRoute.js"; 


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes will be added here
app.use("/api/students", studentRegRoutes);
app.use("/api/feedback", feedbackRoutes);


// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

export default app;
