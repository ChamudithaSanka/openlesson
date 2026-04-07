import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    lesson: {
      type: String,
      required: true,
      trim: true,
      description: "Topic or lesson for the study session",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    meetingLink: {
      type: String,
      trim: true,
      description: "Auto-generated Zoom meeting URL",
    },
    meetingId: {
      type: String,
      trim: true,
      description: "Auto-generated Zoom meeting ID",
    },
    zoomMeetingId: {
      type: Number,
      description: "Zoom API meeting ID for future updates/deletions",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Ongoing", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const StudySession = mongoose.model("StudySession", studySessionSchema);

export default StudySession;
