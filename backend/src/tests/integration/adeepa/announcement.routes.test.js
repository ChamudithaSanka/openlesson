import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Grade from "../../../models/grade.model.js";
import Subject from "../../../models/subject.model.js";
import Announcement from "../../../models/announcement.model.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, userType: user.userType }, process.env.JWT_SECRET);

describe("Adeepa - Announcement Routes Integration Tests", () => {
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

  test("GET /api/announcements should return all announcements without auth", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const grade = await Grade.create({ gradeName: "Grade 1" });
    const subject = await Subject.create({ subjectName: "Math" });
    await Announcement.create({
      title: "Test 1",
      message: "Announcement message 1",
      postedBy: admin._id,
      targetRole: "student",
      gradeId: grade._id,
      subjectId: subject._id,
    });

    const res = await request(app).get("/api/announcements");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("Test 1");
  });

  test("GET /api/announcements/:id should return announcement by ID", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const grade = await Grade.create({ gradeName: "Grade 1" });
    const subject = await Subject.create({ subjectName: "Math" });
    const announcement = await Announcement.create({
      title: "Test Announcement",
      message: "Test announcement message",
      postedBy: admin._id,
      targetRole: "student",
      gradeId: grade._id,
      subjectId: subject._id,
    });

    const res = await request(app).get(`/api/announcements/${announcement._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Test Announcement");
  });

  test("GET /api/announcements/:id should return 404 for missing announcement", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/announcements/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Announcement not found");
  });

  test("POST /api/announcements should require authentication", async () => {
    const res = await request(app)
      .post("/api/announcements")
      .send({ title: "New", description: "Test", gradeId: "grade-1", subjectId: "subject-1" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/announcements should require admin role", async () => {
    const user = await User.create({ email: "user@test.com", password: "pass123", userType: "student", status: "active" });
    const token = createToken(user);

    const res = await request(app)
      .post("/api/announcements")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New", description: "Test", gradeId: "grade-1", subjectId: "subject-1" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/announcements should create announcement for admin", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const grade = await Grade.create({ gradeName: "Grade 1" });
    const subject = await Subject.create({ subjectName: "Math" });
    const token = createToken(admin);

    const res = await request(app)
      .post("/api/announcements")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "New Announcement",
        message: "This is a new announcement message",
        postedBy: admin._id.toString(),
        targetRole: "student",
        gradeId: grade._id.toString(),
        subjectId: subject._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("New Announcement");
  });

  test("PUT /api/announcements/:id should require admin role", async () => {
    const user = await User.create({ email: "user@test.com", password: "pass123", userType: "student", status: "active" });
    const token = createToken(user);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/announcements/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated" });

    expect(res.status).toBe(403);
  });

  test("PUT /api/announcements/:id should update announcement for admin", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const grade = await Grade.create({ gradeName: "Grade 1" });
    const subject = await Subject.create({ subjectName: "Math" });
    const announcement = await Announcement.create({
      title: "Original",
      message: "Original message",
      postedBy: admin._id,
      targetRole: "student",
      gradeId: grade._id,
      subjectId: subject._id,
    });
    const token = createToken(admin);

    const res = await request(app)
      .put(`/api/announcements/${announcement._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Updated Title");
  });

  test("DELETE /api/announcements/:id should require admin role", async () => {
    const user = await User.create({ email: "user@test.com", password: "pass123", userType: "student", status: "active" });
    const token = createToken(user);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/announcements/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test("DELETE /api/announcements/:id should delete announcement for admin", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const grade = await Grade.create({ gradeName: "Grade 1" });
    const subject = await Subject.create({ subjectName: "Math" });
    const announcement = await Announcement.create({
      title: "To Delete",
      message: "Message to delete",
      postedBy: admin._id,
      targetRole: "student",
      gradeId: grade._id,
      subjectId: subject._id,
    });
    const token = createToken(admin);

    const res = await request(app)
      .delete(`/api/announcements/${announcement._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await Announcement.findById(announcement._id);
    expect(deleted).toBeNull();
  });
});
