import Student from '../models/studentRegModel.js';
import User from '../models/user.model.js';

// @desc    Get student profile
// @route   GET /api/students/profile/:id
// @access  Private
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'email')
      .populate('gradeId', 'gradeName');
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (req.user.userType !== 'admin' && student.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile' });
    }

    res.json({
      success: true,
      student
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile/:id
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    const updates = req.body;

    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (req.user.userType !== 'admin' && existingStudent.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    // Prevent updating email/password through this endpoint
    delete updates.email;
    delete updates.password;
    delete updates.userId;

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'email')
      .populate('gradeId', 'gradeName');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      student: updatedStudent
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============ ADMIN ENDPOINTS ============

// @desc    Get all students (Admin only)
// @route   GET /api/students/admin/all
// @access  Private (admin)
export const getAllStudentsAdmin = async (req, res) => {
  try {
    const students = await Student.find()
      .populate({
        path: 'userId',
        select: 'email'

      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single student detail (Admin only)
// @route   GET /api/students/admin/:id
// @access  Private (admin)
export const getStudentDetailAdmin = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate({
        path: 'userId',
        select: 'email'
      });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update student status (Admin only)
// @route   PUT /api/students/admin/:id/status
// @access  Private (admin)
export const updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Use "active" or "inactive"' });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('userId', 'email');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student status updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update student details (Admin only)
// @route   PUT /api/students/admin/:id
// @access  Private (admin)
export const updateStudentAdmin = async (req, res) => {
  try {
    const updates = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Prevent updating userId through this endpoint
    delete updates.userId;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('userId', 'email');

    res.json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete student (Admin only)
// @route   DELETE /api/students/admin/:id
// @access  Private (admin)
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Delete the related user account
    if (student.userId) {
      await User.findByIdAndDelete(student.userId);
    }

    // Delete the student profile
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
