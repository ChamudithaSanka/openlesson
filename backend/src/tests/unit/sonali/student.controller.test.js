import { jest } from "@jest/globals";
import {
  getStudentProfile,
  getMyProfile,
  updateMyProfile,
  updateProfile,
  getAllStudentsAdmin,
  getStudentDetailAdmin,
  updateStudentStatus,
  updateStudentAdmin,
  deleteStudent,
} from "../../../controllers/studentRegController.js";

import Student from "../../../models/studentRegModel.js";
import User from "../../../models/user.model.js";

// ---------- helpers ----------
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (overrides = {}) => ({
  user: { id: "user123", userType: "student" },
  params: {},
  body: {},
  ...overrides,
});

// ============================================================
describe("Sonali - Student Controller Unit Tests", () => {

  afterEach(() => jest.restoreAllMocks()); // ✅ matches your friend's pattern

  // ──────────────────────────────────────────────────────────
  // getStudentProfile
  // ──────────────────────────────────────────────────────────
  describe("getStudentProfile", () => {

    test("should return 404 when student not found", async () => {
      jest.spyOn(Student, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });
      const req = mockReq({ params: { id: "s999" } });
      const res = mockRes();
      await getStudentProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Student not found" })
      );
    });

    test("should return 403 when non-admin views another student's profile", async () => {
      const fakeStudent = {
        _id: "student1",
        userId: { toString: () => "otherUser" },
      };
      jest.spyOn(Student, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(fakeStudent),
        }),
      });
      const req = mockReq({
        user: { id: "user123", userType: "student" },
        params: { id: "student1" },
      });
      const res = mockRes();
      await getStudentProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Not authorized to view this profile" })
      );
    });

    test("should return student profile for the owner", async () => {
      const fakeStudent = {
        _id: "student1",
        userId: { toString: () => "user123" },
      };
      jest.spyOn(Student, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(fakeStudent),
        }),
      });
      const req = mockReq({ params: { id: "student1" } });
      const res = mockRes();
      await getStudentProfile(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, student: fakeStudent })
      );
    });

    test("admin can view any student profile", async () => {
      const fakeStudent = {
        _id: "student1",
        userId: { toString: () => "someOtherUser" },
      };
      jest.spyOn(Student, "findById").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(fakeStudent),
        }),
      });
      const req = mockReq({
        user: { id: "admin1", userType: "admin" },
        params: { id: "student1" },
      });
      const res = mockRes();
      await getStudentProfile(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  // getMyProfile
  // ──────────────────────────────────────────────────────────
  describe("getMyProfile", () => {

    test("should return 404 when student profile not found", async () => {
      jest.spyOn(Student, "findOne").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });
      const req = mockReq();
      const res = mockRes();
      await getMyProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Student profile not found" })
      );
    });

    test("should return student profile for logged-in student", async () => {
      const fakeStudent = { _id: "student1", fullName: "Sonali" };
      jest.spyOn(Student, "findOne").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(fakeStudent),
        }),
      });
      const req = mockReq();
      const res = mockRes();
      await getMyProfile(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, student: fakeStudent })
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  // updateMyProfile
  // ──────────────────────────────────────────────────────────
  describe("updateMyProfile", () => {

    test("should return 404 when student profile not found", async () => {
      jest.spyOn(Student, "findOne").mockResolvedValue(null);
      const req = mockReq({ body: { fullName: "New Name" } });
      const res = mockRes();
      await updateMyProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should not allow updating gradeId", async () => {
      const fakeStudent = { _id: "student1" };
      jest.spyOn(Student, "findOne").mockResolvedValue(fakeStudent);
      const updatedStudent = { _id: "student1", fullName: "Updated" };
      jest.spyOn(Student, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(updatedStudent),
        }),
      });

      const req = mockReq({ body: { fullName: "Updated", gradeId: "grade99" } });
      const res = mockRes();
      await updateMyProfile(req, res);

      const updateArg = Student.findByIdAndUpdate.mock.calls[0][1];
      expect(updateArg.gradeId).toBeUndefined();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  // updateProfile
  // ──────────────────────────────────────────────────────────
  describe("updateProfile", () => {

    test("should return 404 when student not found", async () => {
      jest.spyOn(Student, "findById").mockResolvedValue(null);
      const req = mockReq({ params: { id: "s999" }, body: { fullName: "Test" } });
      const res = mockRes();
      await updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should return 403 for unauthorized update", async () => {
      jest.spyOn(Student, "findById").mockResolvedValue({
        _id: "student1",
        userId: { toString: () => "otherUser" },
      });
      const req = mockReq({
        user: { id: "user123", userType: "student" },
        params: { id: "student1" },
        body: { fullName: "Hack" },
      });
      const res = mockRes();
      await updateProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("should not allow updating email or password", async () => {
      jest.spyOn(Student, "findById").mockResolvedValue({
        _id: "student1",
        userId: { toString: () => "user123" },
      });
      const updatedStudent = { _id: "student1", fullName: "Sonali" };
      jest.spyOn(Student, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(updatedStudent),
        }),
      });

      const req = mockReq({
        params: { id: "student1" },
        body: { fullName: "Sonali", email: "hack@test.com", password: "newpass" },
      });
      const res = mockRes();
      await updateProfile(req, res);

      const updateArg = Student.findByIdAndUpdate.mock.calls[0][1];
      expect(updateArg.email).toBeUndefined();
      expect(updateArg.password).toBeUndefined();
    });
  });

  // ──────────────────────────────────────────────────────────
  // getAllStudentsAdmin
  // ──────────────────────────────────────────────────────────
  describe("getAllStudentsAdmin", () => {

    test("should return all students with count", async () => {
      const fakeStudents = [{ _id: "s1" }, { _id: "s2" }];
      jest.spyOn(Student, "find").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(fakeStudents),
      });
      const req = mockReq({ user: { id: "admin1", userType: "admin" } });
      const res = mockRes();
      await getAllStudentsAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, count: 2 })
      );
    });

    test("should return 500 on error", async () => {
      jest.spyOn(Student, "find").mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error("DB error")),
      });
      const req = mockReq();
      const res = mockRes();
      await getAllStudentsAdmin(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ──────────────────────────────────────────────────────────
  // updateStudentStatus (Admin)
  // ──────────────────────────────────────────────────────────
  describe("updateStudentStatus (Admin)", () => {

    test("should return 400 for invalid status", async () => {
      const req = mockReq({ params: { id: "s1" }, body: { status: "banned" } });
      const res = mockRes();
      await updateStudentStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid status value. Use "active" or "inactive"' })
      );
    });

    test("should return 404 when student not found", async () => {
      jest.spyOn(Student, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      const req = mockReq({ params: { id: "s999" }, body: { status: "inactive" } });
      const res = mockRes();
      await updateStudentStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should update student status to inactive successfully", async () => {
      const fakeStudent = { _id: "s1", status: "inactive" };
      jest.spyOn(Student, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeStudent),
      });
      const req = mockReq({ params: { id: "s1" }, body: { status: "inactive" } });
      const res = mockRes();
      await updateStudentStatus(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Student status updated successfully" })
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  // deleteStudent (Admin)
  // ──────────────────────────────────────────────────────────
  describe("deleteStudent (Admin)", () => {

    test("should return 404 when student not found", async () => {
      jest.spyOn(Student, "findById").mockResolvedValue(null);
      const req = mockReq({ params: { id: "s999" } });
      const res = mockRes();
      await deleteStudent(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should delete student and related user account", async () => {
      const fakeStudent = { _id: "s1", userId: "user123" };
      jest.spyOn(Student, "findById").mockResolvedValue(fakeStudent);
      jest.spyOn(Student, "findByIdAndDelete").mockResolvedValue(fakeStudent);
      jest.spyOn(User, "findByIdAndDelete").mockResolvedValue({ _id: "user123" });

      const req = mockReq({ params: { id: "s1" } });
      const res = mockRes();
      await deleteStudent(req, res);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith("user123");
      expect(Student.findByIdAndDelete).toHaveBeenCalledWith("s1");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Student deleted successfully" })
      );
    });

    test("should return 500 on error", async () => {
      jest.spyOn(Student, "findById").mockRejectedValue(new Error("DB error"));
      const req = mockReq({ params: { id: "s1" } });
      const res = mockRes();
      await deleteStudent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

});
