import mongoose from 'mongoose';

const subjectEnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('SubjectEnrollment', subjectEnrollmentSchema);
