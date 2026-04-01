import StudySession from "../models/studySession.model.js";
import Teacher from "../models/teacher.model.js";
import { createZoomMeeting, deleteZoomMeeting } from "../utils/zoomService.js";

/**
 * Get all study sessions for the logged-in teacher
 */
export const getAllStudySessions = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const sessions = await StudySession.find({ teacherId: teacher._id })
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description")
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/study-sessions/:id
export const getStudySessionById = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id)
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description");
    if (!session) {
      return res.status(404).json({ success: false, message: "Study session not found" });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/study-sessions
export const createStudySession = async (req, res) => {
  try {
    const { lesson, subjectId, gradeId, date, startTime, endTime, notes } = req.body;

    if (!lesson || !subjectId || !gradeId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: lesson, subjectId, gradeId, date, startTime, endTime",
      });
    }

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const teachesSubject = teacher.subjectsTheyTeach.includes(subjectId);
    const teachesGrade = teacher.gradesTheyTeach.includes(gradeId);

    if (!teachesSubject || !teachesGrade) {
      return res.status(403).json({
        success: false,
        message: "You can only create sessions for subjects and grades you teach",
      });
    }

    // Parse date correctly - handle YYYY-MM-DD format
    const [year, month, day] = date.split("-").map(Number);
    const sessionDate = new Date(year, month - 1, day); // month is 0-indexed
    
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    sessionDate.setHours(startHour, startMinute, 0, 0);
    const endDateTime = new Date(sessionDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const duration = Math.round((endDateTime - sessionDate) / (1000 * 60));

    if (duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    if (duration > 1440) {
      return res.status(400).json({
        success: false,
        message: "Session duration cannot exceed 24 hours",
      });
    }

    // Convert to RFC 3339 format for Zoom (YYYY-MM-DDTHH:mm:ss)
    const year_str = sessionDate.getFullYear();
    const month_str = String(sessionDate.getMonth() + 1).padStart(2, "0");
    const day_str = String(sessionDate.getDate()).padStart(2, "0");
    const hour_str = String(sessionDate.getHours()).padStart(2, "0");
    const min_str = String(sessionDate.getMinutes()).padStart(2, "0");
    const sec_str = String(sessionDate.getSeconds()).padStart(2, "0");
    
    const startTimeUTC = `${year_str}-${month_str}-${day_str}T${hour_str}:${min_str}:${sec_str}`;

    const zoomResult = await createZoomMeeting({
      topic: `${lesson} - Class Session`,
      start_time: startTimeUTC,
      duration: duration,
      description: `Subject: Class Study Session\nTopic: ${lesson}`,
    });

    if (!zoomResult.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to create Zoom meeting: " + zoomResult.error,
      });
    }

    const newSession = await StudySession.create({
      lesson,
      subjectId,
      gradeId,
      teacherId: teacher._id,
      date: sessionDate,
      startTime,
      endTime,
      meetingLink: zoomResult.data.joinUrl,
      meetingId: zoomResult.data.meetingId,
      zoomMeetingId: zoomResult.data.zoomMeetingId,
      notes,
      status: "Scheduled",
    });

    const populatedSession = await StudySession.findById(newSession._id)
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description");

    res.status(201).json({
      success: true,
      message: "Study session created successfully",
      data: populatedSession,
    });
  } catch (error) {
    console.error("Error creating study session:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/study-sessions/:id
export const updateStudySession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Study session not found",
      });
    }

    if (req.body.meetingLink !== undefined) {
      delete req.body.meetingLink;
    }
    if (req.body.meetingId !== undefined) {
      delete req.body.meetingId;
    }
    if (req.body.zoomMeetingId !== undefined) {
      delete req.body.zoomMeetingId;
    }

    const allowedFields = ["lesson", "date", "startTime", "endTime", "notes", "status"];
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        session[key] = req.body[key];
      }
    });

    await session.save();

    const updatedSession = await StudySession.findById(session._id)
      .populate("gradeId", "gradeName description")
      .populate("subjectId", "subjectName description");

    res.status(200).json({
      success: true,
      message: "Study session updated successfully",
      data: updatedSession,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/study-sessions/:id
export const deleteStudySession = async (req, res) => {
  try {
    const session = await StudySession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Study session not found",
      });
    }

    if (session.zoomMeetingId) {
      await deleteZoomMeeting(session.zoomMeetingId);
    }

    await StudySession.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Study session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting study session:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
