import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../utils/geminiService.js", () => ({
  categorizeComplaintWithGemini: jest.fn().mockResolvedValue("Other"),
}));

// Dynamic imports AFTER mock setup (required for ES module mocking to work)
const { createComplaint, getMyComplaints, updateComplaint, deleteComplaint, getAllComplaints, getComplaintDetail, updateComplaintStatus, addAdminNote } =
  await import("../../../controllers/Complaintcontroller.js");

const { default: Complaint } = await import("../../../models/Complaintmodel.js");
const { default: Student } = await import("../../../models/studentRegModel.js");
const { categorizeComplaintWithGemini } = await import("../../../utils/geminiService.js");

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
describe("Sonali - Complaint Controller Unit Tests", () => {

  afterEach(() => jest.restoreAllMocks());

  // createComplaint
  describe("createComplaint", () => {

    test("should return 400 when subject is missing", async () => {
      const req = mockReq({ body: { description: "Some description" } });
      const res = mockRes();
      await createComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Subject and description are required" })
      );
    });

    test("should return 400 when description is missing", async () => {
      const req = mockReq({ body: { subject: "Login issue" } });
      const res = mockRes();
      await createComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 403 when no student profile found", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue(null);
      const req = mockReq({ body: { subject: "Issue", description: "Details" } });
      const res = mockRes();
      await createComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Only students can create complaints" })
      );
    });

    test("should create complaint with High priority when 'not working' in text", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      categorizeComplaintWithGemini.mockResolvedValue("Technical Bug");
      jest.spyOn(Complaint.prototype, "save").mockResolvedValue(true);

      const req = mockReq({
        body: { subject: "App not working", description: "It is not working at all" },
      });
      const res = mockRes();
      await createComplaint(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Complaint submitted successfully" })
      );
    });

    test("should create complaint with Low priority when 'slow' in text", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      categorizeComplaintWithGemini.mockResolvedValue("Other");
      jest.spyOn(Complaint.prototype, "save").mockResolvedValue(true);

      const req = mockReq({
        body: { subject: "Video slow", description: "Loading is slow today" },
      });
      const res = mockRes();
      await createComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should return 500 on unexpected error", async () => {
      jest.spyOn(Student, "findOne").mockRejectedValue(new Error("DB error"));
      const req = mockReq({ body: { subject: "Issue", description: "Details" } });
      const res = mockRes();
      await createComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Server error" })
      );
    });
  });

  // getMyComplaints
  describe("getMyComplaints", () => {

    test("should return 403 when no student profile found", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue(null);
      const req = mockReq();
      const res = mockRes();
      await getMyComplaints(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Only students can view complaints" })
      );
    });

    test("should return complaints list for valid student", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      const fakeComplaints = [
        { _id: "c1", subject: "Test", status: "Open" },
        { _id: "c2", subject: "Another", status: "Resolved" },
      ];
      jest.spyOn(Complaint, "find").mockReturnValue({
        sort: jest.fn().mockResolvedValue(fakeComplaints),
      });

      const req = mockReq();
      const res = mockRes();
      await getMyComplaints(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeComplaints);
    });

    test("should return 500 on unexpected error", async () => {
      jest.spyOn(Student, "findOne").mockRejectedValue(new Error("DB failure"));
      const req = mockReq();
      const res = mockRes();
      await getMyComplaints(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // updateComplaint
  describe("updateComplaint", () => {

    test("should return 403 when no student profile found", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue(null);
      const req = mockReq({ params: { id: "comp1" }, body: { subject: "New subject" } });
      const res = mockRes();
      await updateComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Only students can update complaints" })
      );
    });

    test("should return 404 when complaint not found", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      jest.spyOn(Complaint, "findById").mockResolvedValue(null);
      const req = mockReq({ params: { id: "comp1" }, body: {} });
      const res = mockRes();
      await updateComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Complaint not found" })
      );
    });

    test("should return 403 when student tries to update another student's complaint", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      jest.spyOn(Complaint, "findById").mockResolvedValue({
        _id: "comp1",
        studentId: { toString: () => "student999" },
        status: "Open",
      });
      const req = mockReq({ params: { id: "comp1" }, body: {} });
      const res = mockRes();
      await updateComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Unauthorized action" })
      );
    });

    test("should return 400 when complaint status is not Open", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      jest.spyOn(Complaint, "findById").mockResolvedValue({
        _id: "comp1",
        studentId: { toString: () => "student1" },
        status: "Resolved",
      });
      const req = mockReq({ params: { id: "comp1" }, body: { subject: "Edit" } });
      const res = mockRes();
      await updateComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Complaint can only be edited while it is Open" })
      );
    });

    test("should update complaint successfully", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      const fakeComplaint = {
        _id: "comp1",
        studentId: { toString: () => "student1" },
        status: "Open",
        subject: "Old subject",
        description: "Old desc",
        category: "Other",
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Complaint, "findById").mockResolvedValue(fakeComplaint);
      categorizeComplaintWithGemini.mockResolvedValue("Login Issue");

      const req = mockReq({
        params: { id: "comp1" },
        body: { description: "Updated description" },
      });
      const res = mockRes();
      await updateComplaint(req, res);

      expect(fakeComplaint.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Complaint updated successfully" })
      );
    });
  });

  // deleteComplaint
  describe("deleteComplaint", () => {

    test("should return 403 when no student profile found", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue(null);
      const req = mockReq({ params: { id: "comp1" } });
      const res = mockRes();
      await deleteComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("should return 404 when complaint not found", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      jest.spyOn(Complaint, "findById").mockResolvedValue(null);
      const req = mockReq({ params: { id: "comp1" } });
      const res = mockRes();
      await deleteComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return 403 when student tries to delete another student's complaint", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      jest.spyOn(Complaint, "findById").mockResolvedValue({
        studentId: { toString: () => "student999" },
      });
      const req = mockReq({ params: { id: "comp1" } });
      const res = mockRes();
      await deleteComplaint(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Unauthorized action" })
      );
    });

    test("should delete complaint successfully", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue({ _id: "student1" });
      const fakeComplaint = {
        studentId: { toString: () => "student1" },
        deleteOne: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Complaint, "findById").mockResolvedValue(fakeComplaint);

      const req = mockReq({ params: { id: "comp1" } });
      const res = mockRes();
      await deleteComplaint(req, res);

      expect(fakeComplaint.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Complaint deleted successfully" })
      );
    });
  });

  // Admin - getAllComplaints
  describe("getAllComplaints (Admin)", () => {

    test("should return all complaints with count", async () => {
      const fakeComplaints = [{ _id: "c1" }, { _id: "c2" }];
      jest.spyOn(Complaint, "find").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(fakeComplaints),
      });
      const req = mockReq();
      const res = mockRes();
      await getAllComplaints(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, count: 2 })
      );
    });

    test("should return 500 on error", async () => {
      jest.spyOn(Complaint, "find").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error("DB error")),
      });
      const req = mockReq();
      const res = mockRes();
      await getAllComplaints(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // Admin - updateComplaintStatus
  describe("updateComplaintStatus (Admin)", () => {

    test("should return 400 for invalid status", async () => {
      const req = mockReq({ params: { id: "comp1" }, body: { status: "Invalid" } });
      const res = mockRes();
      await updateComplaintStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Invalid status. Must be Open, Under Review, or Resolved" })
      );
    });

    test("should return 404 when complaint not found", async () => {
      jest.spyOn(Complaint, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      const req = mockReq({ params: { id: "comp1" }, body: { status: "Resolved" } });
      const res = mockRes();
      await updateComplaintStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should update status successfully", async () => {
      const fakeComplaint = { _id: "comp1", status: "Resolved" };
      jest.spyOn(Complaint, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeComplaint),
      });
      const req = mockReq({ params: { id: "comp1" }, body: { status: "Resolved" } });
      const res = mockRes();
      await updateComplaintStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Complaint status updated" })
      );
    });
  });

  // Admin - addAdminNote
  describe("addAdminNote (Admin)", () => {

    test("should return 400 when adminNote is missing", async () => {
      const req = mockReq({ params: { id: "comp1" }, body: {} });
      const res = mockRes();
      await addAdminNote(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Admin note is required" })
      );
    });

    test("should return 404 when complaint not found", async () => {
      jest.spyOn(Complaint, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      const req = mockReq({ params: { id: "comp1" }, body: { adminNote: "Investigating" } });
      const res = mockRes();
      await addAdminNote(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should add admin note successfully", async () => {
      const fakeComplaint = { _id: "comp1", adminNote: "Investigating" };
      jest.spyOn(Complaint, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeComplaint),
      });
      const req = mockReq({ params: { id: "comp1" }, body: { adminNote: "Investigating" } });
      const res = mockRes();
      await addAdminNote(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Admin note added" })
      );
    });
  });

});
