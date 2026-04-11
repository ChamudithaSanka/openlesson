import { jest } from "@jest/globals";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../controllers/subject.controller.js";
import Subject from "../../../models/subject.model.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Adeepa - Subject Controller Unit Tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("getAllSubjects should return all subjects", async () => {
    const req = {};
    const res = mockRes();
    const mockSubjects = [{ _id: "subject-1", subjectName: "Math" }];

    jest.spyOn(Subject, "find").mockResolvedValue(mockSubjects);

    await getAllSubjects(req, res);

    expect(Subject.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockSubjects });
  });

  test("getAllSubjects should handle database error", async () => {
    const req = {};
    const res = mockRes();

    jest.spyOn(Subject, "find").mockRejectedValue(new Error("DB error"));

    await getAllSubjects(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "DB error" });
  });

  test("getSubjectById should return subject when found", async () => {
    const req = { params: { id: "subject-1" } };
    const res = mockRes();
    const mockSubject = { _id: "subject-1", subjectName: "Math" };

    jest.spyOn(Subject, "findById").mockResolvedValue(mockSubject);

    await getSubjectById(req, res);

    expect(Subject.findById).toHaveBeenCalledWith("subject-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockSubject });
  });

  test("getSubjectById should return 404 when subject not found", async () => {
    const req = { params: { id: "missing-id" } };
    const res = mockRes();

    jest.spyOn(Subject, "findById").mockResolvedValue(null);

    await getSubjectById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Subject not found" });
  });

  test("createSubject should create subject for valid data", async () => {
    const req = { body: { subjectName: "English", description: "English Language" } };
    const res = mockRes();
    const mockCreated = { _id: "subject-new", ...req.body };

    jest.spyOn(Subject, "create").mockResolvedValue(mockCreated);

    await createSubject(req, res);

    expect(Subject.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCreated });
  });

  test("createSubject should return 400 on validation error", async () => {
    const req = { body: { subjectName: "" } };
    const res = mockRes();

    jest.spyOn(Subject, "create").mockRejectedValue(new Error("Validation failed"));

    await createSubject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Validation failed" });
  });

  test("updateSubject should update subject when found", async () => {
    const req = { params: { id: "subject-1" }, body: { subjectName: "Advanced Math" } };
    const res = mockRes();
    const mockUpdated = { _id: "subject-1", subjectName: "Advanced Math" };

    jest.spyOn(Subject, "findByIdAndUpdate").mockResolvedValue(mockUpdated);

    await updateSubject(req, res);

    expect(Subject.findByIdAndUpdate).toHaveBeenCalledWith(
      "subject-1",
      req.body,
      expect.objectContaining({ returnDocument: "after", runValidators: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUpdated });
  });

  test("updateSubject should return 404 when not found", async () => {
    const req = { params: { id: "missing-id" }, body: { subjectName: "Updated" } };
    const res = mockRes();

    jest.spyOn(Subject, "findByIdAndUpdate").mockResolvedValue(null);

    await updateSubject(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Subject not found" });
  });

  test("updateSubject should return 400 on validation error", async () => {
    const req = { params: { id: "subject-1" }, body: { subjectName: "" } };
    const res = mockRes();

    jest.spyOn(Subject, "findByIdAndUpdate").mockRejectedValue(new Error("Validation failed"));

    await updateSubject(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Validation failed" });
  });

  test("deleteSubject should delete subject when found", async () => {
    const req = { params: { id: "subject-1" } };
    const res = mockRes();
    const mockDeleted = { _id: "subject-1", subjectName: "Math" };

    jest.spyOn(Subject, "findByIdAndDelete").mockResolvedValue(mockDeleted);

    await deleteSubject(req, res);

    expect(Subject.findByIdAndDelete).toHaveBeenCalledWith("subject-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Subject deleted" });
  });

  test("deleteSubject should return 404 when not found", async () => {
    const req = { params: { id: "missing-id" } };
    const res = mockRes();

    jest.spyOn(Subject, "findByIdAndDelete").mockResolvedValue(null);

    await deleteSubject(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Subject not found" });
  });
});
