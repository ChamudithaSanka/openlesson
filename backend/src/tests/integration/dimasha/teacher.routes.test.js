import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Teacher from "../../../models/teacher.model.js";
import Grade from "../../../models/grade.model.js";
import Subject from "../../../models/subject.model.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, userType: user.userType }, process.env.JWT_SECRET);

describe("Dimasha - Teacher Routes Integration Tests", () => {
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

  describe("GET /api/teachers", () => {
    test("should return 200 and list all teachers", async () => {
      // Create test data
      const teacherUser = await User.create({
        email: "teacher1@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      await Teacher.create({
        userId: teacherUser._id,
        fullName: "Teacher 1",
        status: "Approved",
      });

      const res = await request(app).get("/api/teachers");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.teachers)).toBe(true);
    });

    test("should return empty teachers array initially", async () => {
      const res = await request(app).get("/api/teachers");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.teachers).toEqual([]);
    });
  });

  describe("POST /api/teachers", () => {
    test("should return 401 without authentication token", async () => {
      const res = await request(app).post("/api/teachers").send({
        fullName: "New Teacher",
        email: "newteacher@test.com",
        password: "pass123",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return 400 for missing required fields", async () => {
      const adminUser = await User.create({
        email: "admin@test.com",
        password: "pass123",
        userType: "admin",
        status: "active",
      });

      const token = createToken(adminUser);

      const res = await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Only Name" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("required");
    });

    test("should return 400 when email already exists", async () => {
      const adminUser = await User.create({
        email: "admin@test.com",
        password: "pass123",
        userType: "admin",
        status: "active",
      });

      const token = createToken(adminUser);

      // Create first teacher
      await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          fullName: "Teacher One",
          email: "duplicate@test.com",
          password: "pass123",
        });

      // Try to create with same email
      const res = await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          fullName: "Teacher Two",
          email: "duplicate@test.com",
          password: "pass123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already registered");
    });

    test("should create teacher successfully", async () => {
      const adminUser = await User.create({
        email: "admin@test.com",
        password: "pass123",
        userType: "admin",
        status: "active",
      });

      const token = createToken(adminUser);

      const res = await request(app)
        .post("/api/teachers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          fullName: "John Doe",
          email: "john@test.com",
          password: "pass123",
          phone: "0712345678",
          qualification: "BSc Mathematics",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.teacher.fullName).toBe("John Doe");
      expect(res.body.teacher.userId.email).toBe("john@test.com");
    });
  });

  describe("GET /api/teachers/my-profile", () => {
    test("should return 401 without token", async () => {
      const res = await request(app).get("/api/teachers/my-profile");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 when teacher profile not found", async () => {
      const user = await User.create({
        email: "noTeacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const token = createToken(user);

      const res = await request(app)
        .get("/api/teachers/my-profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    test("should return teacher's own profile", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "My Teacher",
        qualification: "BSc",
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .get("/api/teachers/my-profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.teacher.fullName).toBe("My Teacher");
    });
  });

  describe("GET /api/teachers/pending", () => {
    test("should return 401 without authentication", async () => {
      const res = await request(app).get("/api/teachers/pending");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return pending teachers", async () => {
      const adminUser = await User.create({
        email: "admin@test.com",
        password: "pass123",
        userType: "admin",
        status: "active",
      });

      const teacherUser = await User.create({
        email: "pending@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      await Teacher.create({
        userId: teacherUser._id,
        fullName: "Pending Teacher",
        status: "Pending",
      });

      const token = createToken(adminUser);

      const res = await request(app)
        .get("/api/teachers/pending")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });
  });

  describe("PUT /api/teachers/:id/status", () => {
    test("should return 400 for invalid status", async () => {
      const adminUser = await User.create({
        email: "admin@test.com",
        password: "pass123",
        userType: "admin",
        status: "active",
      });

      const temp = await Teacher.create({
        userId: adminUser._id,
        fullName: "Temp",
      });

      const token = createToken(adminUser);

      const res = await request(app)
        .put(`/api/teachers/${temp._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "InvalidStatus" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should update teacher status to Approved", async () => {
      const adminUser = await User.create({
        email: "admin@test.com",
        password: "pass123",
        userType: "admin",
        status: "active",
      });

      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "Teacher to Approve",
        status: "Pending",
      });

      const token = createToken(adminUser);

      const res = await request(app)
        .put(`/api/teachers/${teacher._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "Approved" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.teacher.status).toBe("Approved");
    });

    test("should return 404 for non-existent teacher", async () => {
      const adminUser = await User.create({
        email: "admin@test.com",
        password: "pass123",
        userType: "admin",
        status: "active",
      });

      const token = createToken(adminUser);
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/teachers/${fakeId}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "Approved" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/teachers/:id", () => {
    test("should return 401 without token", async () => {
      const res = await request(app).put("/api/teachers/anyid").send({ fullName: "Updated" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 when teacher not found", async () => {
      const user = await User.create({
        email: "user@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const token = createToken(user);
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/teachers/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Updated" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should update teacher profile", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "Original Name",
        qualification: "BSc",
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .put(`/api/teachers/${teacher._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Updated Name", phone: "0771234567" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.teacher.fullName).toBe("Updated Name");
      expect(res.body.teacher.phone).toBe("0771234567");
    });
  });

  describe("DELETE /api/teachers/:id", () => {
    test("should return 401 without token", async () => {
      const res = await request(app).delete("/api/teachers/anyid");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 when teacher not found", async () => {
      const adminUser = await User.create({
        email: "admin@test.com",
        password: "pass123",
        userType: "admin",
        status: "active",
      });

      const token = createToken(adminUser);
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/teachers/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should delete teacher and related user", async () => {
      const adminUser = await User.create({
        email: "admin@test.com",
        password: "pass123",
        userType: "admin",
        status: "active",
      });

      const teacherUser = await User.create({
        email: "delete@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "To Delete",
      });

      const token = createToken(adminUser);

      const res = await request(app)
        .delete(`/api/teachers/${teacher._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const deletedTeacher = await Teacher.findById(teacher._id);
      const deletedUser = await User.findById(teacherUser._id);

      expect(deletedTeacher).toBeNull();
      expect(deletedUser).toBeNull();
    });
  });
});
