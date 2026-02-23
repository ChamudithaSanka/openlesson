/**
 * Quiz Model
 * Defines the schema and model for Quiz documents in MongoDB
 */

const mongoose = require('mongoose');

/**
 * Quiz Schema Definition
 * Defines the structure and validation rules for quiz documents
 */
const quizSchema = new mongoose.Schema(
  {
    // Quiz title - required, trimmed, max 200 characters
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true, // Remove whitespace from both ends
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    
    // Quiz description - required, trimmed
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
      trim: true
    },
    
    // Reference to Teacher who created the quiz
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher', // Reference to Teacher collection
      required: [true, 'Teacher ID is required']
    },
    
    // Reference to Subject the quiz belongs to
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject', // Reference to Subject collection
      required: [true, 'Subject ID is required']
    },
    
    // Reference to Grade level for the quiz
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade', // Reference to Grade collection
      required: [true, 'Grade ID is required']
    },
    
    // Quiz status - draft, published, or archived
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'], // Only allow these values
      default: 'draft' // Default status is draft
    },
    
    // Time limit for quiz in minutes
    timeLimit: {
      type: Number,
      required: [true, 'Time limit is required'],
      min: [1, 'Time limit must be at least 1 minute']
    },
    
    // Total points possible for the quiz
    totalPoints: {
      type: Number,
      required: [true, 'Total points is required'],
      min: [0, 'Total points cannot be negative']
    }
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Create and export the Quiz model
const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
