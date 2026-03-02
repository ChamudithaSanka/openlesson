import StudyMaterial from "../models/studyMaterial.model.js";

// @desc    Create a new study material
// @route   POST /api/study-materials
// @access  Public
export const createStudyMaterial = async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.create(req.body);
    res.status(201).json({ success: true, studyMaterial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all study materials
// @route   GET /api/study-materials
// @access  Public
export const getAllStudyMaterials = async (req, res) => {
  try {
    const studyMaterials = await StudyMaterial.find()
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description")
      .populate("teacherId", "fullName email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: studyMaterials.length, studyMaterials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single study material by ID
// @route   GET /api/study-materials/:id
// @access  Public
export const getStudyMaterialById = async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.findById(req.params.id)
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description")
      .populate("teacherId", "fullName email qualification");

    if (!studyMaterial) {
      return res.status(404).json({ success: false, message: "Study material not found" });
    }

    res.json({ success: true, studyMaterial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update study material
// @route   PUT /api/study-materials/:id
// @access  Public
export const updateStudyMaterial = async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description")
      .populate("teacherId", "fullName email");

    if (!studyMaterial) {
      return res.status(404).json({ success: false, message: "Study material not found" });
    }

    res.json({ success: true, studyMaterial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete study material
// @route   DELETE /api/study-materials/:id
// @access  Public
export const deleteStudyMaterial = async (req, res) => {
  try {
    const studyMaterial = await StudyMaterial.findByIdAndDelete(req.params.id);

    if (!studyMaterial) {
      return res.status(404).json({ success: false, message: "Study material not found" });
    }

    res.json({ success: true, message: "Study material deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
