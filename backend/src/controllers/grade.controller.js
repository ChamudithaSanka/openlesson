import Grade from "../models/grade.model.js";

// GET /api/grades
export const getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find();
    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/grades/:id
export const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ success: false, message: "Grade not found" });
    }
    res.status(200).json({ success: true, data: grade });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/grades
export const createGrade = async (req, res) => {
  try {
    const grade = await Grade.create(req.body);
    res.status(201).json({ success: true, data: grade });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/grades/:id
export const updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!grade) {
      return res.status(404).json({ success: false, message: "Grade not found" });
    }
    res.status(200).json({ success: true, data: grade });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/grades/:id
export const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ success: false, message: "Grade not found" });
    }
    res.status(200).json({ success: true, message: "Grade deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
