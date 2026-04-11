import { jest } from "@jest/globals";
import {
  createStudyMaterial,
  getAllStudyMaterials,
  getStudyMaterialById,
  updateStudyMaterial,
  deleteStudyMaterial,
} from "../../../controllers/studyMaterial.controller.js";
import StudyMaterial from "../../../models/studyMaterial.model.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Dimasha - Study Material Controller Unit Tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createStudyMaterial", () => {
    test("should create study material and return 201", async () => {
      const req = {
        body: {
          title: "Math Basics",
          description: "Introduction to Math",
          gradeId: "grade-1",
          subjectId: "subject-1",
          teacherId: "teacher-1",
          fileUrl: "https://example.com/math.pdf",
          fileType: "PDF",
        },
      };
      const res = mockRes();

      const studyMaterialDoc = {
        _id: "material-1",
        title: "Math Basics",
        description: "Introduction to Math",
      };

      jest.spyOn(StudyMaterial, "create").mockResolvedValue(studyMaterialDoc);

      await createStudyMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        studyMaterial: studyMaterialDoc,
      });
    });

    test("should return 500 when database error occurs", async () => {
      const req = { body: { title: "Material" } };
      const res = mockRes();

      jest.spyOn(StudyMaterial, "create").mockRejectedValue(new Error("DB Error"));

      await createStudyMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB Error",
      });
    });
  });

  describe("getAllStudyMaterials", () => {
    test("should return all study materials with count", async () => {
      const res = mockRes();

      const materials = [
        { _id: "m1", title: "Material 1" },
        { _id: "m2", title: "Material 2" },
      ];

      const thirdPopulate = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue(materials) });
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      jest.spyOn(StudyMaterial, "find").mockReturnValue({ populate: firstPopulate });

      const req = {};
      await getAllStudyMaterials(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        studyMaterials: materials,
      });
    });

    test("should return empty array when no materials exist", async () => {
      const res = mockRes();

      const thirdPopulate = jest.fn().mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      jest.spyOn(StudyMaterial, "find").mockReturnValue({ populate: firstPopulate });

      const req = {};
      await getAllStudyMaterials(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        studyMaterials: [],
      });
    });

    test("should return 500 when error occurs", async () => {
      const res = mockRes();

      jest.spyOn(StudyMaterial, "find").mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      const req = {};
      await getAllStudyMaterials(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Database connection failed",
      });
    });
  });

  describe("getStudyMaterialById", () => {
    test("should return study material when found", async () => {
      const req = { params: { id: "material-1" } };
      const res = mockRes();

      const materialData = {
        _id: "material-1",
        title: "Math Basics",
        gradeId: { gradeName: "Grade 10" },
        subjectId: { subjectName: "Math" },
        teacherId: { fullName: "John Doe" },
      };

      const thirdPopulate = jest.fn().mockResolvedValue(materialData);
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      jest.spyOn(StudyMaterial, "findById").mockReturnValue({ populate: firstPopulate });

      await getStudyMaterialById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        studyMaterial: materialData,
      });
    });

    test("should return 404 when material not found", async () => {
      const req = { params: { id: "missing-id" } };
      const res = mockRes();

      const thirdPopulate = jest.fn().mockResolvedValue(null);
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      jest.spyOn(StudyMaterial, "findById").mockReturnValue({ populate: firstPopulate });

      await getStudyMaterialById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Study material not found",
      });
    });

    test("should return 500 when error occurs", async () => {
      const req = { params: { id: "material-1" } };
      const res = mockRes();

      jest.spyOn(StudyMaterial, "findById").mockImplementation(() => {
        throw new Error("Query error");
      });

      await getStudyMaterialById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Query error",
      });
    });
  });

  describe("updateStudyMaterial", () => {
    test("should update study material successfully", async () => {
      const req = {
        params: { id: "material-1" },
        body: { title: "Updated Title", description: "Updated Description" },
      };
      const res = mockRes();

      const updatedMaterial = {
        _id: "material-1",
        title: "Updated Title",
        description: "Updated Description",
      };

      const thirdPopulate = jest.fn().mockResolvedValue(updatedMaterial);
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      jest.spyOn(StudyMaterial, "findByIdAndUpdate").mockReturnValue({ populate: firstPopulate });

      await updateStudyMaterial(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        studyMaterial: updatedMaterial,
      });
    });

    test("should return 404 when material not found for update", async () => {
      const req = {
        params: { id: "missing-id" },
        body: { title: "New Title" },
      };
      const res = mockRes();

      const thirdPopulate = jest.fn().mockResolvedValue(null);
      const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      jest.spyOn(StudyMaterial, "findByIdAndUpdate").mockReturnValue({ populate: firstPopulate });

      await updateStudyMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Study material not found",
      });
    });
  });

  describe("deleteStudyMaterial", () => {
    test("should delete study material successfully", async () => {
      const req = { params: { id: "material-1" } };
      const res = mockRes();

      const deletedMaterial = { _id: "material-1", title: "Material" };

      jest.spyOn(StudyMaterial, "findByIdAndDelete").mockResolvedValue(deletedMaterial);

      await deleteStudyMaterial(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Study material deleted successfully",
      });
      expect(StudyMaterial.findByIdAndDelete).toHaveBeenCalledWith("material-1");
    });

    test("should return 404 when material not found for deletion", async () => {
      const req = { params: { id: "missing-id" } };
      const res = mockRes();

      jest.spyOn(StudyMaterial, "findByIdAndDelete").mockResolvedValue(null);

      await deleteStudyMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Study material not found",
      });
    });

    test("should return 500 when error occurs during deletion", async () => {
      const req = { params: { id: "material-1" } };
      const res = mockRes();

      jest.spyOn(StudyMaterial, "findByIdAndDelete").mockRejectedValue(new Error("Delete error"));

      await deleteStudyMaterial(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Delete error",
      });
    });
  });
});
