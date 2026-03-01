import StudySession from "../models/studySession.model.js";

// GET /api/study-sessions
export const getAllStudySessions = async (req, res) => {
  try {
    const sessions = await StudySession.find()
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description");
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/study-sessions/:id
export const getStudySessionById = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id)
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description");
    if (!session) {
      return res.status(404).json({ success: false, message: "Study session not found" });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/study-sessions
export const createStudySession = async (req, res) => {
  try {
    const session = await StudySession.create(req.body);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/study-sessions/:id
export const updateStudySession = async (req, res) => {
  try {
    const session = await StudySession.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!session) {
      return res.status(404).json({ success: false, message: "Study session not found" });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/study-sessions/:id
export const deleteStudySession = async (req, res) => {
  try {
    const session = await StudySession.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Study session not found" });
    }
    res.status(200).json({ success: true, message: "Study session deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
