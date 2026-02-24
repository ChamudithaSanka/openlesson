import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  qualification: { type: String },
  gradesTheyTeach: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade" }],
  subjectsTheyTeach: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
}, { timestamps: true });

export default mongoose.model("Teacher", teacherSchema);