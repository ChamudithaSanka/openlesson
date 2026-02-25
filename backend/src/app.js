import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import quizRoutes from './routes/quizRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';

app.use('/api/quizzes', quizRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/subjects', subjectRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'OpenLesson API is running', status: 'success' });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server error",
  });
});

export default app;
