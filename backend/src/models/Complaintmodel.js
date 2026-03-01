import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Login Issue", "Video/Content Issue", "Technical Bug", "Payment Issue", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Open", "Under Review", "Resolved"],
      default: "Open",
    },
    adminNote: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;