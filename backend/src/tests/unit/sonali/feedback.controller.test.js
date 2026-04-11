import { jest } from "@jest/globals";
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  getFeedbackByStudent,
  updateFeedback,
  deleteFeedback,
} from "../../../controllers/feedbackController.js";

// ✅ NO jest.mock() — use spyOn like your friend (donor/quiz tests)
import Feedback from "../../../models/feedbackModel.js";
import Student from "../../../models/studentRegModel.js";

// ---------- helpers ----------
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides = {}) => ({
  user: { id: "user123" },
  params: {},
  body: {},
  ...overrides,
});

// ============================================================
describe("Sonali - Feedback Controller Unit Tests", () => {

  afterEach(() => jest.restoreAllMocks()); // ✅ matches your friend's pattern

  // ──────────────────────────────────────────────────────────
  // createFeedback
  // ──────────────────────────────────────────────────────────
  describe("createFeedback", () => {

    test("should return 404 when student profile not found", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue(null);
      const req = mockReq({
        body: { teacherId: "teacher1", rating: 5, comment: "Great!" },
      });
      const res = mockRes();
      await createFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Student profile not found" })
      );
    });

    test("should create feedback successfully", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      jest.spyOn(Feedback.prototype, "save").mockResolvedValue(true);

      const req = mockReq({
        body: { teacherId: "teacher1", rating: 5, comment: "Excellent teacher" },
      });
      const res = mockRes();
      await createFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Feedback created successfully" })
      );
    });

    test("should return 500 on unexpected error", async () => {
      jest.spyOn(Student, "findOne").mockRejectedValue(new Error("DB error"));
      const req = mockReq({
        body: { teacherId: "teacher1", rating: 4, comment: "Good" },
      });
      const res = mockRes();
      await createFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Server error" })
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  // getAllFeedback
  // ──────────────────────────────────────────────────────────
  describe("getAllFeedback", () => {

    test("should return all feedbacks", async () => {
      const fakeFeedbacks = [{ _id: "fb1", rating: 5 }, { _id: "fb2", rating: 3 }];
      jest.spyOn(Feedback, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(fakeFeedbacks),
        }),
      });

      const req = mockReq();
      const res = mockRes();
      await getAllFeedback(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ feedbacks: fakeFeedbacks })
      );
    });

    test("should return 500 on error", async () => {
      jest.spyOn(Feedback, "find").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      });
      const req = mockReq();
      const res = mockRes();
      await getAllFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ──────────────────────────────────────────────────────────
  // getFeedbackById
  // ──────────────────────────────────────────────────────────
  describe("getFeedbackById", () => {

    test("should return 404 when feedback not found", async () => {
      jest.spyOn(Feedback, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });
      const req = mockReq({ params: { id: "fb999" } });
      const res = mockRes();
      await getFeedbackById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Feedback not found" })
      );
    });

    test("should return feedback when found", async () => {
      const fakeFeedback = { _id: "fb1", rating: 4, comment: "Good" };
      jest.spyOn(Feedback, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(fakeFeedback),
        }),
      });
      const req = mockReq({ params: { id: "fb1" } });
      const res = mockRes();
      await getFeedbackById(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ feedback: fakeFeedback })
      );
    });

    test("should return 500 on error", async () => {
      jest.spyOn(Feedback, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error("DB error")),
        }),
      });
      const req = mockReq({ params: { id: "fb1" } });
      const res = mockRes();
      await getFeedbackById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ──────────────────────────────────────────────────────────
  // getFeedbackByStudent
  // ──────────────────────────────────────────────────────────
  describe("getFeedbackByStudent", () => {

    test("should return feedbacks for a student", async () => {
      const fakeFeedbacks = [{ _id: "fb1", rating: 5 }];
      jest.spyOn(Feedback, "find").mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeFeedbacks),
      });
      const req = mockReq({ params: { studentId: "student1" } });
      const res = mockRes();
      await getFeedbackByStudent(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ feedbacks: fakeFeedbacks })
      );
    });

    test("should return 500 on error", async () => {
      jest.spyOn(Feedback, "find").mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      });
      const req = mockReq({ params: { studentId: "student1" } });
      const res = mockRes();
      await getFeedbackByStudent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ──────────────────────────────────────────────────────────
  // updateFeedback
  // ──────────────────────────────────────────────────────────
  describe("updateFeedback", () => {

    test("should update feedback and return updated document", async () => {
      const updatedFeedback = { _id: "fb1", rating: 4, comment: "Updated comment" };
      jest.spyOn(Feedback, "findByIdAndUpdate").mockResolvedValue(updatedFeedback);

      const req = mockReq({
        params: { id: "fb1" },
        body: { rating: 4, comment: "Updated comment" },
      });
      const res = mockRes();
      await updateFeedback(req, res);

      expect(Feedback.findByIdAndUpdate).toHaveBeenCalledWith(
        "fb1",
        { rating: 4, comment: "Updated comment" },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Feedback updated" })
      );
    });

    test("should return 500 on error", async () => {
      jest.spyOn(Feedback, "findByIdAndUpdate").mockRejectedValue(new Error("DB error"));
      const req = mockReq({ params: { id: "fb1" }, body: { rating: 3 } });
      const res = mockRes();
      await updateFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ──────────────────────────────────────────────────────────
  // deleteFeedback
  // ──────────────────────────────────────────────────────────
  describe("deleteFeedback", () => {

    test("should delete feedback successfully", async () => {
      jest.spyOn(Feedback, "findByIdAndDelete").mockResolvedValue({ _id: "fb1" });
      const req = mockReq({ params: { id: "fb1" } });
      const res = mockRes();
      await deleteFeedback(req, res);
      expect(Feedback.findByIdAndDelete).toHaveBeenCalledWith("fb1");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Feedback deleted" })
      );
    });

    test("should return 500 on error", async () => {
      jest.spyOn(Feedback, "findByIdAndDelete").mockRejectedValue(new Error("DB error"));
      const req = mockReq({ params: { id: "fb1" } });
      const res = mockRes();
      await deleteFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

});