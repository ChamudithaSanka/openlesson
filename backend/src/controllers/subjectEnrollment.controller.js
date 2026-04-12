import SubjectEnrollment from '../models/subjectEnrollment.model.js';
import Student from '../models/studentRegModel.js';
import Subject from '../models/subject.model.js';

// POST /api/subject-enrollments
export const enrollSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    const exists = await SubjectEnrollment.findOne({ studentId: student._id, subjectId });
    if (exists) return res.status(400).json({ success: false, message: 'Already enrolled' });
    const enrollment = await SubjectEnrollment.create({ studentId: student._id, subjectId });
    res.status(201).json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/subject-enrollments/my-subjects
export const getMyEnrolledSubjects = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const enrollments = await SubjectEnrollment.find({ studentId: student._id }).populate('subjectId');
    const subjects = enrollments.map(e => e.subjectId);
    res.json({ success: true, subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/subject-enrollments/:subjectId
export const unenrollSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const enrollment = await SubjectEnrollment.findOneAndDelete({ studentId: student._id, subjectId });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    res.json({ success: true, message: 'Unenrolled from subject' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
