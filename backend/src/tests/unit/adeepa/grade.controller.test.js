import { jest } from "@jest/globals";
import {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../../../controllers/grade.controller.js";
import Grade from "../../../models/grade.model.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Adeepa - Grade Controller Unit Tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("getAllGrades should return all grades", async () => {
    const req = {};
    const res = mockRes();
    const mockGrades = [{ _id: "grade-1", gradeName: "Grade 1" }];

    jest.spyOn(Grade, "find").mockResolvedValue(mockGrades);

    await getAllGrades(req, res);

    expect(Grade.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockGrades });
  });

  test("getAllGrades should handle database error", async () => {
    const req = {};
    const res = mockRes();

    jest.spyOn(Grade, "find").mockRejectedValue(new Error("DB error"));

    await getAllGrades(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "DB error" });
  });

  test("getGradeById should return grade when found", async () => {
    const req = { params: { id: "grade-1" } };
    const res = mockRes();
    const mockGrade = { _id: "grade-1", gradeName: "Grade 1" };

    jest.spyOn(Grade, "findById").mockResolvedValue(mockGrade);

    await getGradeById(req, res);

    expect(Grade.findById).toHaveBeenCalledWith("grade-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockGrade });
  });

  test("getGradeById should return 404 when grade not found", async () => {
    const req = { params: { id: "missing-id" } };
    const res = mockRes();

    jest.spyOn(Grade, "findById").mockResolvedValue(null);

    await getGradeById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Grade not found" });
  });

  test("createGrade should create grade for valid data", async () => {
    const req = { body: { gradeName: "Grade 5", description: "Fifth Grade" } };
    const res = mockRes();
    const mockCreated = { _id: "grade-new", ...req.body };

    jest.spyOn(Grade, "create").mockResolvedValue(mockCreated);

    await createGrade(req, res);

    expect(Grade.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCreated });
  });

  test("createGrade should return 400 on validation error", async () => {
    const req = { body: { gradeName: "" } };
    const res = mockRes();

    jest.spyOn(Grade, "create").mockRejectedValue(new Error("Validation failed"));

    await createGrade(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Validation failed" });
  });

  test("updateGrade should update grade when found", async () => {
    const req = { params: { id: "grade-1" }, body: { gradeName: "Grade 1 Updated" } };
    const res = mockRes();
    const mockUpdated = { _id: "grade-1", gradeName: "Grade 1 Updated" };

    jest.spyOn(Grade, "findByIdAndUpdate").mockResolvedValue(mockUpdated);

    await updateGrade(req, res);

    expect(Grade.findByIdAndUpdate).toHaveBeenCalledWith(
      "grade-1",
      req.body,
      expect.objectContaining({ returnDocument: "after", runValidators: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUpdated });
  });

  test("updateGrade should return 404 when not found", async () => {
    const req = { params: { id: "missing-id" }, body: { gradeName: "Updated" } };
    const res = mockRes();

    jest.spyOn(Grade, "findByIdAndUpdate").mockResolvedValue(null);

    await updateGrade(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Grade not found" });
  });

  test("updateGrade should return 400 on validation error", async () => {
    const req = { params: { id: "grade-1" }, body: { gradeName: "" } };
    const res = mockRes();

    jest.spyOn(Grade, "findByIdAndUpdate").mockRejectedValue(new Error("Validation failed"));

    await updateGrade(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Validation failed" });
  });

  test("deleteGrade should delete grade when found", async () => {
    const req = { params: { id: "grade-1" } };
    const res = mockRes();
    const mockDeleted = { _id: "grade-1", gradeName: "Grade 1" };

    jest.spyOn(Grade, "findByIdAndDelete").mockResolvedValue(mockDeleted);

    await deleteGrade(req, res);

    expect(Grade.findByIdAndDelete).toHaveBeenCalledWith("grade-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Grade deleted" });
  });

  test("deleteGrade should return 404 when not found", async () => {
    const req = { params: { id: "missing-id" } };
    const res = mockRes();

    jest.spyOn(Grade, "findByIdAndDelete").mockResolvedValue(null);

    await deleteGrade(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Grade not found" });
  });
});
