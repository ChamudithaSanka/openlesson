import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  gradeName: { type: String, required: true },
  description: String
}, { timestamps: true });

export default mongoose.model('Grade', gradeSchema);