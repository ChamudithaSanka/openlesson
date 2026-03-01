import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    gradeName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Grade = mongoose.model("Grade", gradeSchema);

export default Grade;
