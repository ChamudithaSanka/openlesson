import Teacher from "../models/teacher.model.js";

// @desc    Get teacher profile
// @route   GET /api/teachers/profile/:id
// @access  Private
export const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("userId", "email")
      .populate("gradesTheyTeach", "gradeName description")
      .populate("subjectsTheyTeach", "subjectName description");

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    if (req.user.userType !== "admin" && teacher.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to view this profile" });
    }

    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Public
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate("userId", "email")
      .populate("gradesTheyTeach", "gradeName description")
      .populate("subjectsTheyTeach", "subjectName description")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending teachers for verification
// @route   GET /api/teachers/pending
// @access  Private (admin)
export const getPendingTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ status: "Pending" })
      .populate("userId", "email")
      .populate("gradesTheyTeach", "gradeName description")
      .populate("subjectsTheyTeach", "subjectName description")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject teacher
// @route   PUT /api/teachers/:id/status
// @access  Private (admin)
export const updateTeacherStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("userId", "email")
      .populate("gradesTheyTeach", "gradeName description")
      .populate("subjectsTheyTeach", "subjectName description");

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update teacher profile
// @route   PUT /api/teachers/:id
// @access  Private
export const updateTeacher = async (req, res) => {
  try {
    const updates = req.body;

    const existingTeacher = await Teacher.findById(req.params.id);
    if (!existingTeacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    if (req.user.userType !== "admin" && existingTeacher.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this profile" });
    }

    // Prevent updating userId through this endpoint
    delete updates.userId;

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate("userId", "email")
      .populate("gradesTheyTeach", "gradeName description")
      .populate("subjectsTheyTeach", "subjectName description");

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (admin)
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

