import Teacher from "../models/teacher.model.js";
import User from "../models/user.model.js";
import { sendApprovalEmail, sendRejectionEmail } from "../utils/emailService.js";

// @desc    Get current teacher's profile (for logged-in teacher)
// @route   GET /api/teachers/my-profile
// @access  Private
export const getMyTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id })
      .populate("userId", "email")
      .populate("gradesTheyTeach", "gradeName description")
      .populate("subjectsTheyTeach", "subjectName description");

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher profile not found" });
    }

    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

// @desc    Create new teacher (Admin only)
// @route   POST /api/teachers
// @access  Private (admin)
export const createTeacher = async (req, res) => {
  try {
    const { fullName, email, password, phone, qualification, status } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Email, and Password are required",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user account with teacher type
    const user = await User.create({
      email,
      password,
      userType: "teacher",
      status: "active",
    });

    // Create teacher profile
    const teacher = await Teacher.create({
      userId: user._id,
      fullName,
      phone: phone || "",
      qualification: qualification || "",
      status: status || "Pending",
    });

    // Populate user details
    const populatedTeacher = await teacher.populate("userId", "email");

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      teacher: populatedTeacher,
    });
  } catch (error) {
    // If teacher creation fails, delete the user that was created
    if (error.message.includes("Teacher")) {
      await User.findByIdAndDelete(user._id);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject teacher
// @route   PUT /api/teachers/:id/status
// @access  Private (admin)
export const updateTeacherStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

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

    // Send email notification based on status
    try {
      const teacherEmail = teacher.userId?.email;
      const teacherName = teacher.fullName;

      if (status === "Approved" && teacherEmail) {
        await sendApprovalEmail(teacherEmail, teacherName);
      } else if (status === "Rejected" && teacherEmail) {
        await sendRejectionEmail(teacherEmail, teacherName, rejectionReason);
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError.message);
      // Continue even if email fails - don't block the status update
    }

    res.json({ success: true, teacher, message: `Teacher status updated to ${status}` });
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
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Delete the related user account
    if (teacher.userId) {
      await User.findByIdAndDelete(teacher.userId);
    }

    // Delete the teacher profile
    await Teacher.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ADMIN ENDPOINTS ============

// 🔹 Get All Teachers (Admin Only)
export const getAllTeachersAdmin = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate({
        path: "userId",
        select: "email"
      })
      .populate({
        path: "gradesTheyTeach",
        select: "gradeName description"
      })
      .populate({
        path: "subjectsTheyTeach",
        select: "subjectName description"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      teachers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// 🔹 Get Single Teacher (Admin Only)
export const getTeacherDetailAdmin = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate({
        path: "userId",
        select: "email"
      })
      .populate({
        path: "gradesTheyTeach",
        select: "gradeName description"
      })
      .populate({
        path: "subjectsTheyTeach",
        select: "subjectName description"
      });

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    res.status(200).json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// 🔹 Approve Teacher (Admin Only)
export const approveTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    )
      .populate({
        path: "userId",
        select: "email"
      })
      .populate({
        path: "gradesTheyTeach",
        select: "gradeName description"
      })
      .populate({
        path: "subjectsTheyTeach",
        select: "subjectName description"
      });

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Send approval email
    try {
      const teacherEmail = teacher.userId?.email;
      const teacherName = teacher.fullName;

      if (teacherEmail) {
        await sendApprovalEmail(teacherEmail, teacherName);
        console.log(`✅ Approval email sent to ${teacherEmail}`);
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError.message);
      // Continue even if email fails - don't block the approval
    }

    res.status(200).json({
      success: true,
      message: "Teacher approved successfully",
      teacher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// 🔹 Reject Teacher (Admin Only)
export const rejectTeacher = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    )
      .populate({
        path: "userId",
        select: "email"
      })
      .populate({
        path: "gradesTheyTeach",
        select: "gradeName description"
      })
      .populate({
        path: "subjectsTheyTeach",
        select: "subjectName description"
      });

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Send rejection email
    try {
      const teacherEmail = teacher.userId?.email;
      const teacherName = teacher.fullName;

      if (teacherEmail) {
        await sendRejectionEmail(teacherEmail, teacherName, rejectionReason);
        console.log(`✅ Rejection email sent to ${teacherEmail}`);
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError.message);
      // Continue even if email fails - don't block the rejection
    }

    res.status(200).json({
      success: true,
      message: "Teacher rejected",
      teacher
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

