import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    cvUrl: {
      type: String,
      trim: true,
    },
    cvFile: {
      data: Buffer,
      filename: String,
      mimetype: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
    gradesTheyTeach: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Grade",
      },
    ],
    subjectsTheyTeach: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;
