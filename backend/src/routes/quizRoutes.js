/**
 * Quiz Routes
 * Defines all API endpoints for quiz CRUD operations
 * Base URL: /api/quizzes
 */

const express = require('express');
const router = express.Router();

// Import all controller functions
const {
  getAllQuizzes,  // Get all quizzes
  getQuizById,    // Get single quiz by ID
  createQuiz,     // Create new quiz
  updateQuiz,     // Update existing quiz
  deleteQuiz      // Delete quiz
} = require('../controllers/quizController');

// ============================================
// ROUTES
// ============================================

/**
 * @route   GET /api/quizzes
 * @desc    Get all quizzes
 * @access  Public
 * 
 * @route   POST /api/quizzes
 * @desc    Create a new quiz
 * @access  Public
 */
router.route('/')
  .get(getAllQuizzes)   // GET request - retrieve all quizzes
  .post(createQuiz);    // POST request - create new quiz

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get single quiz by ID
 * @access  Public
 * 
 * @route   PUT /api/quizzes/:id
 * @desc    Update quiz by ID
 * @access  Public
 * 
 * @route   DELETE /api/quizzes/:id
 * @desc    Delete quiz by ID
 * @access  Public
 */
router.route('/:id')
  .get(getQuizById)     // GET request - retrieve specific quiz
  .put(updateQuiz)      // PUT request - update specific quiz
  .delete(deleteQuiz);  // DELETE request - remove specific quiz

// Export router for use in server.js
module.exports = router;
