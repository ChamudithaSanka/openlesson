import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Enrollment', enrollmentSchema);
