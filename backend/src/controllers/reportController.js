import Report from "../models/reportModel.js";
import Notification from "../models/notificationModel.js";

// 🔹 Create Report
export const createReport = async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        message: "Subject and description are required",
      });
    }

    const newReport = new Report({
      studentId: req.user.id,
      subject,
      description,
    });

    await newReport.save();

    // Create notification for student
    await Notification.create({
      studentId: req.user.id,
      type: "Report",
      message: `Your report on "${subject}" has been submitted successfully.`,
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 🔹 Get Logged-in Student Reports
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({
      studentId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 🔹 Update Report
export const updateReport = async (req, res) => {
  try {
    const { subject, description } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (subject) report.subject = subject;
    if (description) report.description = description;

    await report.save();


    //Notify student about the update
    await Notification.create({
      studentId: report.studentId,
      type: "Report",
      message: `Your report on "${report.subject}" has been updated. New status: ${report.status || "Updated"}`,
    });


    res.status(200).json({
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 🔹 Delete Report
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await report.deleteOne();

    res.status(200).json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};