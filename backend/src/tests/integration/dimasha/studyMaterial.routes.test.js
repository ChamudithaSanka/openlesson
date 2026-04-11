import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Teacher from "../../../models/teacher.model.js";
import Grade from "../../../models/grade.model.js";
import Subject from "../../../models/subject.model.js";
import StudyMaterial from "../../../models/studyMaterial.model.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, userType: user.userType }, process.env.JWT_SECRET);

describe("Dimasha - Study Material Routes Integration Tests", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe("GET /api/study-materials", () => {
    test("should return 200 and list all study materials", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const teacher = await Teacher.create({ userId: teacherUser._id, fullName: "Teacher" });

      await StudyMaterial.create({
        title: "Math Material",
        gradeId: grade._id,
        subjectId: subject._id,
        teacherId: teacher._id,
        materialType: "PDF",
        fileUrl: "https://example.com/math.pdf",
      });

      const res = await request(app).get("/api/study-materials");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(Array.isArray(res.body.studyMaterials)).toBe(true);
    });

    test("should return empty array when no materials exist", async () => {
      const res = await request(app).get("/api/study-materials");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.studyMaterials).toEqual([]);
    });
  });

  describe("POST /api/study-materials", () => {
    test("should create study material successfully", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const teacher = await Teacher.create({ userId: teacherUser._id, fullName: "Teacher" });
      const token = createToken(teacherUser);

      const res = await request(app)
        .post("/api/study-materials")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Introduction to Math",
          gradeId: grade._id,
          subjectId: subject._id,
          teacherId: teacher._id,
          materialType: "PDF",
          fileUrl: "https://example.com/intro.pdf",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.studyMaterial.title).toBe("Introduction to Math");
    });

    test("should return 500 for invalid data", async () => {
      const teacherUser = await User.create({
        email: "teacher2@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const token = createToken(teacherUser);

      const res = await request(app)
        .post("/api/study-materials")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "No ID Material" });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/study-materials/:id", () => {
    test("should return study material by ID", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const teacher = await Teacher.create({ userId: teacherUser._id, fullName: "Teacher" });

      const material = await StudyMaterial.create({
        title: "Math Basics",
        gradeId: grade._id,
        subjectId: subject._id,
        teacherId: teacher._id,
        materialType: "PDF",
        fileUrl: "https://example.com/math.pdf",
      });

      const res = await request(app).get(`/api/study-materials/${material._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.studyMaterial.title).toBe("Math Basics");
      expect(res.body.studyMaterial._id).toBe(material._id.toString());
    });

    test("should return 404 when material not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/study-materials/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not found");
    });

    test("should return 500 for invalid ID format", async () => {
      const res = await request(app).get("/api/study-materials/invalid-id");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/study-materials/:id", () => {
    test("should update study material", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const teacher = await Teacher.create({ userId: teacherUser._id, fullName: "Teacher" });
      const token = createToken(teacherUser);

      const material = await StudyMaterial.create({
        title: "Original Title",
        gradeId: grade._id,
        subjectId: subject._id,
        teacherId: teacher._id,
        materialType: "PDF",
        fileUrl: "https://example.com/material.pdf",
      });

      const res = await request(app)
        .put(`/api/study-materials/${material._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated Title" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.studyMaterial.title).toBe("Updated Title");
    });

    test("should return 404 when material not found for update", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const token = createToken(teacherUser);
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/study-materials/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should return 500 for invalid ID format in update", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const token = createToken(teacherUser);

      const res = await request(app)
        .put("/api/study-materials/invalid-id")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated" });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("DELETE /api/study-materials/:id", () => {
    test("should delete study material", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const teacher = await Teacher.create({ userId: teacherUser._id, fullName: "Teacher" });
      const token = createToken(teacherUser);

      const material = await StudyMaterial.create({
        title: "To Delete",
        description: "Will be deleted",
        gradeId: grade._id,
        subjectId: subject._id,
        teacherId: teacher._id,
        materialType: "PDF",
        fileUrl: "https://example.com/delete.pdf",
      });

      const res = await request(app)
        .delete(`/api/study-materials/${material._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("deleted successfully");

      // Verify deletion
      const deletedMaterial = await StudyMaterial.findById(material._id);
      expect(deletedMaterial).toBeNull();
    });

    test("should return 404 when material not found for deletion", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const token = createToken(teacherUser);
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/study-materials/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should return 500 for invalid ID format in delete", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const token = createToken(teacherUser);

      const res = await request(app)
        .delete("/api/study-materials/invalid-id")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("CRUD Flow Test", () => {
    test("should complete full CRUD operations", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Science" });
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const teacher = await Teacher.create({ userId: teacherUser._id, fullName: "Teacher" });
      const token = createToken(teacherUser);

      // CREATE
      const createRes = await request(app)
        .post("/api/study-materials")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Science Basics",
          gradeId: grade._id,
          subjectId: subject._id,
          teacherId: teacher._id,
          materialType: "PDF",
          fileUrl: "https://example.com/science.pdf",
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      const materialId = createRes.body.studyMaterial._id;

      // READ
      const readRes = await request(app).get(`/api/study-materials/${materialId}`);
      expect(readRes.status).toBe(200);
      expect(readRes.body.studyMaterial.title).toBe("Science Basics");

      // UPDATE
      const updateRes = await request(app)
        .put(`/api/study-materials/${materialId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Advanced Science" });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.studyMaterial.title).toBe("Advanced Science");

      // DELETE
      const deleteRes = await request(app)
        .delete(`/api/study-materials/${materialId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(deleteRes.status).toBe(200);

      // Verify deletion
      const verifyRes = await request(app).get(`/api/study-materials/${materialId}`);
      expect(verifyRes.status).toBe(404);
    });
  });
});
