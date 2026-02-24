/**
 * Quiz Controller
 * Handles all business logic for quiz CRUD operations
 * Contains controller functions that process requests and return responses
 */

const Quiz = require('../models/Quiz');

// ============================================
// GET ALL QUIZZES
// ============================================

/**
 * @desc    Get all quizzes from database
 * @route   GET /api/quizzes
 * @access  Public
 * @returns {Object} JSON response with array of all quizzes
 */
const getAllQuizzes = async (req, res) => {
  try {
    // Retrieve all quiz documents from database
    const quizzes = await Quiz.find();
    
    // Send success response with quizzes data
    res.status(200).json({
      success: true,
      count: quizzes.length,  // Total number of quizzes
      data: quizzes           // Array of quiz objects
    });
  } catch (error) {
    // Handle any errors (database connection, etc.)
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// GET SINGLE QUIZ BY ID
// ============================================

/**
 * @desc    Get single quiz by ID
 * @route   GET /api/quizzes/:id
 * @access  Public
 * @param   {string} req.params.id - Quiz ID from URL parameter
 * @returns {Object} JSON response with single quiz data
 */
const getQuizById = async (req, res) => {
  try {
    // Find quiz by ID from URL parameter
    const quiz = await Quiz.findById(req.params.id);

    // Check if quiz exists
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Send success response with quiz data
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    // Handle errors (invalid ID format, database errors, etc.)
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// ============================================
// CREATE NEW QUIZ
// ============================================

/**
 * @desc    Create new quiz
 * @route   POST /api/quizzes
 * @access  Public
 * @param   {Object} req.body - Quiz data from request body
 * @returns {Object} JSON response with created quiz data
 */
const createQuiz = async (req, res) => {
  try {
    // Create new quiz document with data from request body
    // Mongoose will validate the data against the schema
    const quiz = await Quiz.create(req.body);

    // Send success response with created quiz (status 201 = Created)
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    // Handle validation errors or database errors
    res.status(400).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

// ============================================
// UPDATE QUIZ
// ============================================

/**
 * @desc    Update existing quiz
 * @route   PUT /api/quizzes/:id
 * @access  Public
 * @param   {string} req.params.id - Quiz ID from URL parameter
 * @param   {Object} req.body - Updated quiz data from request body
 * @returns {Object} JSON response with updated quiz data
 */
const updateQuiz = async (req, res) => {
  try {
    // Find quiz by ID and update with new data
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,      // Quiz ID to find
      req.body,           // New data to update
      {
        new: true,        // Return the updated document instead of original
        runValidators: true  // Run schema validators on update
      }
    );

    // Check if quiz exists
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Send success response with updated quiz data
    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    // Handle validation errors or database errors
    res.status(400).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
};

// ============================================
// DELETE QUIZ
// ============================================

/**
 * @desc    Delete quiz by ID
 * @route   DELETE /api/quizzes/:id
 * @access  Public
 * @param   {string} req.params.id - Quiz ID from URL parameter
 * @returns {Object} JSON response confirming deletion
 */
const deleteQuiz = async (req, res) => {
  try {
    // Find quiz by ID and delete it
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    // Check if quiz exists
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Send success response confirming deletion
    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
      data: {}  // Empty object as no data to return
    });
  } catch (error) {
    // Handle errors (invalid ID, database errors, etc.)
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

// ============================================
// EXPORT ALL CONTROLLER FUNCTIONS
// ============================================

module.exports = {
  getAllQuizzes,  // Export GET all quizzes function
  getQuizById,    // Export GET single quiz function
  createQuiz,     // Export CREATE quiz function
  updateQuiz,     // Export UPDATE quiz function
  deleteQuiz      // Export DELETE quiz function
};
