import { jest } from "@jest/globals";
import {
  getMyTeacherProfile,
  getTeacherProfile,
  getAllTeachers,
  getPendingTeachers,
  updateTeacher,
  deleteTeacher,
} from "../../../controllers/teacher.controller.js";
import Teacher from "../../../models/teacher.model.js";
import User from "../../../models/user.model.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Dimasha - Teacher Controller Unit Tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getMyTeacherProfile", () => {
    test("should return 404 when teacher profile not found", async () => {
      const req = { user: { id: "teacher-1" } };
      const res = mockRes();

      const thirdPopulate = jest.fn().mockResolvedValue(null);
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      jest.spyOn(Teacher, "findOne").mockReturnValue({ populate: firstPopulate });

      await getMyTeacherProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Teacher profile not found",
      });
    });

    test("should return teacher profile with populated data", async () => {
      const req = { user: { id: "teacher-1" } };
      const res = mockRes();

      const teacherData = {
        _id: "teacher-id",
        userId: { email: "teacher@test.com" },
        fullName: "John Doe",
        gradesTheyTeach: [{ gradeName: "Grade 10" }],
        subjectsTheyTeach: [{ subjectName: "Math" }],
      };

      const thirdPopulate = jest.fn().mockResolvedValue(teacherData);
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      jest.spyOn(Teacher, "findOne").mockReturnValue({ populate: firstPopulate });

      await getMyTeacherProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, teacher: teacherData });
    });

    test("should return 500 when error occurs", async () => {
      const req = { user: { id: "teacher-1" } };
      const res = mockRes();

      jest.spyOn(Teacher, "findOne").mockImplementation(() => {
        throw new Error("Database error");
      });

      await getMyTeacherProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error",
      });
    });
  });

  describe("getTeacherProfile", () => {
    test("should return 404 when teacher not found", async () => {
      const req = { params: { id: "teacher-1" }, user: { id: "user-1", userType: "teacher" } };
      const res = mockRes();

      const thirdPopulate = jest.fn().mockResolvedValue(null);
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      jest.spyOn(Teacher, "findById").mockReturnValue({ populate: firstPopulate });

      await getTeacherProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Teacher not found",
      });
    });
  });

  describe("getAllTeachers", () => {
    test("should return all teachers with count", async () => {
      const res = mockRes();

      const teachers = [
        { _id: "t1", fullName: "Teacher 1" },
        { _id: "t2", fullName: "Teacher 2" },
      ];

      const sortMock = jest.fn().mockResolvedValue(teachers);
      const thirdPopulate = jest.fn().mockReturnValue({ sort: sortMock });
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });
      const findMock = jest.fn().mockReturnValue({ populate: firstPopulate });

      jest.spyOn(Teacher, "find").mockImplementation(findMock);

      const req = {};
      await getAllTeachers(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        teachers,
      });
    });

    test("should return empty array when no teachers exist", async () => {
      const res = mockRes();

      const sortMock = jest.fn().mockResolvedValue([]);
      const thirdPopulate = jest.fn().mockReturnValue({ sort: sortMock });
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });
      const findMock = jest.fn().mockReturnValue({ populate: firstPopulate });

      jest.spyOn(Teacher, "find").mockImplementation(findMock);

      const req = {};
      await getAllTeachers(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        teachers: [],
      });
    });
  });

  describe("getPendingTeachers", () => {
    test("should return all pending teachers", async () => {
      const res = mockRes();

      const pendingTeachers = [{ _id: "t1", fullName: "Pending Teacher", status: "Pending" }];

      const sortMock = jest.fn().mockResolvedValue(pendingTeachers);
      const thirdPopulate = jest.fn().mockReturnValue({ sort: sortMock });
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });
      const findMock = jest.fn().mockReturnValue({ populate: firstPopulate });

      jest.spyOn(Teacher, "find").mockImplementation(findMock);

      const req = {};
      await getPendingTeachers(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        teachers: pendingTeachers,
      });
    });
  });

  describe("updateTeacher", () => {
    test("should return 404 when teacher not found", async () => {
      const req = { params: { id: "missing" }, body: { fullName: "New Name" }, user: { id: "user1" } };
      const res = mockRes();

      jest.spyOn(Teacher, "findById").mockResolvedValue(null);

      await updateTeacher(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Teacher not found",
      });
    });

    test("should return 403 when user not authorized", async () => {
      const req = {
        params: { id: "t1" },
        body: { fullName: "New Name" },
        user: { id: "user2", userType: "teacher" },
      };
      const res = mockRes();

      jest.spyOn(Teacher, "findById").mockResolvedValue({
        _id: "t1",
        userId: "user1",
      });

      await updateTeacher(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Not authorized to update this profile",
      });
    });

    test("should update teacher successfully", async () => {
      const req = {
        params: { id: "t1" },
        body: { fullName: "Updated Name" },
        user: { id: "user1", userType: "admin" },
      };
      const res = mockRes();

      const existingTeacher = {
        _id: "t1",
        userId: "user1",
        fullName: "Old Name",
      };

      const updatedTeacher = {
        _id: "t1",
        userId: { email: "teacher@test.com" },
        fullName: "Updated Name",
      };

      jest.spyOn(Teacher, "findById").mockResolvedValue(existingTeacher);

      const thirdPopulate = jest.fn().mockResolvedValue(updatedTeacher);
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      jest.spyOn(Teacher, "findByIdAndUpdate").mockReturnValue({ populate: firstPopulate });

      await updateTeacher(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        teacher: updatedTeacher,
      });
    });
  });

  describe("deleteTeacher", () => {
    test("should return 404 when teacher not found", async () => {
      const req = { params: { id: "missing" } };
      const res = mockRes();

      jest.spyOn(Teacher, "findById").mockResolvedValue(null);

      await deleteTeacher(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Teacher not found",
      });
    });

    test("should delete teacher and related user", async () => {
      const req = { params: { id: "t1" } };
      const res = mockRes();

      const teacherData = { _id: "t1", userId: "user-1" };

      jest.spyOn(Teacher, "findById").mockResolvedValue(teacherData);
      jest.spyOn(User, "findByIdAndDelete").mockResolvedValue({ _id: "user-1" });
      jest.spyOn(Teacher, "findByIdAndDelete").mockResolvedValue(teacherData);

      await deleteTeacher(req, res);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith("user-1");
      expect(Teacher.findByIdAndDelete).toHaveBeenCalledWith("t1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Teacher deleted successfully",
      });
    });

    test("should handle teacher with no user ID", async () => {
      const req = { params: { id: "t1" } };
      const res = mockRes();

      const teacherData = { _id: "t1", userId: null };

      jest.spyOn(Teacher, "findById").mockResolvedValue(teacherData);
      jest.spyOn(Teacher, "findByIdAndDelete").mockResolvedValue(teacherData);

      await deleteTeacher(req, res);

      expect(Teacher.findByIdAndDelete).toHaveBeenCalledWith("t1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Teacher deleted successfully",
      });
    });
  });
});
