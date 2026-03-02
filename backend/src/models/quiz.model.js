// Quiz Model - Defines quiz data structure in MongoDB

import mongoose from "mongoose";

// Question Schema - Structure for each question
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ["single", "multiple"],  // single or multiple choice
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswers: {
    type: [Number],
    required: true,  // indices of correct options
  },
});

// Quiz Schema - Main quiz structure
const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",  // reference to Subject collection
      required: true,
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",  // reference to Grade collection
      required: true,
    },
    questions: [questionSchema],
    totalPoints: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,  // in minutes
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",  // reference to Teacher collection
      required: true,
    },
  },
  { timestamps: true }  // adds createdAt and updatedAt automatically
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
