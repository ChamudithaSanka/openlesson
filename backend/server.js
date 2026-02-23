/**
 * OpenLesson Backend Server
 * Main entry point for the application
 * Handles server initialization, middleware setup, and route configuration
 */

// Import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable CORS (Cross-Origin Resource Sharing) for all routes
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

// ============================================
// DATABASE CONNECTION
// ============================================

// Connect to MongoDB database
connectDB();

// ============================================
// API ROUTES
// ============================================

// Quiz routes - handles all CRUD operations for quizzes
app.use('/api/quizzes', require('./src/routes/quizRoutes'));

// Health check route - verify API is running
app.get('/', (req, res) => {
  res.json({ message: 'OpenLesson API is running' });
});

// ============================================
// START SERVER
// ============================================

// Get port from environment variable or use 5000 as default
const PORT = process.env.PORT || 5000;

// Start listening on specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
