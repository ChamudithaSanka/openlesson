import Enrollment from '../models/enrollment.model.js';
import Student from '../models/studentRegModel.js';
import Teacher from '../models/teacher.model.js';

// POST /api/enrollments
export const enrollTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    // Prevent duplicate enrollment
    const exists = await Enrollment.findOne({ studentId: student._id, teacherId });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Already enrolled' });
    }
    const enrollment = await Enrollment.create({ studentId: student._id, teacherId });
    res.status(201).json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/enrollments/my-teachers
export const getMyEnrolledTeachers = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    const enrollments = await Enrollment.find({ studentId: student._id }).populate('teacherId');
    const teachers = enrollments.map(e => e.teacherId);
    res.json({ success: true, teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
