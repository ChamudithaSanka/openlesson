// Quiz Controller - Handles all quiz operations

import Quiz from "../models/quiz.model.js";

// CREATE - Add new quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, description, duration, subjectId, gradeId, createdBy, questions } = req.body;

    // Validate required fields
    if (!title || !subjectId || !gradeId || !createdBy || !questions) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, subjectId, gradeId, createdBy, questions' 
      });
    }

    // Calculate total points from questions
    const totalPoints = questions.reduce((sum, q) => sum + (parseInt(q.points) || 1), 0);

    const quiz = await Quiz.create({
      title,
      description,
      duration: duration || 30,
      subjectId,
      gradeId,
      createdBy,
      questions,
      totalPoints,
    });

    // Populate the created quiz before returning
    const populatedQuiz = await quiz.populate([
      { path: 'gradeId', select: 'gradeName description' },
      { path: 'subjectId', select: 'subjectName description' },
      { path: 'createdBy', select: 'fullName email' }
    ]);

    res.status(201).json({ success: true, quiz: populatedQuiz });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// READ - Get all quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description")
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: quizzes.length, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// READ - Get single quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description")
      .populate("createdBy", "fullName email qualification");

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE - Edit quiz
export const updateQuiz = async (req, res) => {
  try {
    const { questions } = req.body;
    
    // If questions are being updated, recalculate totalPoints
    let updateData = { ...req.body };
    if (questions && Array.isArray(questions)) {
      updateData.totalPoints = questions.reduce((sum, q) => sum + (parseInt(q.points) || 1), 0);
    }

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description")
      .populate("createdBy", "fullName email");

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE - Remove quiz
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.json({ success: true, message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
