import Student from '../models/studentRegModel.js';

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
