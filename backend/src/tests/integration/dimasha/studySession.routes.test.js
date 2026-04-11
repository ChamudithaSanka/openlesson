import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Teacher from "../../../models/teacher.model.js";
import Grade from "../../../models/grade.model.js";
import Subject from "../../../models/subject.model.js";
import StudySession from "../../../models/studySession.model.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, userType: user.userType }, process.env.JWT_SECRET);

describe("Dimasha - Study Session Routes Integration Tests", () => {
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

  describe("GET /api/study-sessions", () => {
    test("should return 401 without token", async () => {
      const res = await request(app).get("/api/study-sessions");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 when teacher profile not found", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .get("/api/study-sessions")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should return teacher's study sessions", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });

      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "Teacher",
        subjectsTheyTeach: [subject._id],
        gradesTheyTeach: [grade._id],
      });

      await StudySession.create({
        lesson: "Math Basics",
        subjectId: subject._id,
        gradeId: grade._id,
        teacherId: teacher._id,
        date: new Date(),
        startTime: "10:00",
        endTime: "11:00",
        meetingLink: "https://zoom.us/j/123",
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .get("/api/study-sessions")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/study-sessions/:id", () => {
    test("should return study session by ID", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const teacher = await Teacher.create({ userId: teacherUser._id, fullName: "Teacher" });

      const session = await StudySession.create({
        lesson: "Algebra",
        subjectId: subject._id,
        gradeId: grade._id,
        teacherId: teacher._id,
        date: new Date(),
        startTime: "10:00",
        endTime: "11:00",
        meetingLink: "https://zoom.us/j/123",
      });

      const res = await request(app).get(`/api/study-sessions/${session._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lesson).toBe("Algebra");
    });

    test("should return 404 when session not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/study-sessions/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should return 500 for invalid ID format", async () => {
      const res = await request(app).get("/api/study-sessions/invalid-id");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/study-sessions", () => {
    test("should return 401 without token", async () => {
      const res = await request(app).post("/api/study-sessions").send({
        lesson: "Math",
        subjectId: "subject-1",
        gradeId: "grade-1",
        date: "2025-12-20",
        startTime: "10:00",
        endTime: "11:00",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return 400 when required fields are missing", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .post("/api/study-sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({ lesson: "Only lesson" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Missing required fields");
    });

    test("should return 404 when teacher profile not found", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .post("/api/study-sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          lesson: "Math",
          subjectId: "subject-1",
          gradeId: "grade-1",
          date: "2025-12-20",
          startTime: "10:00",
          endTime: "11:00",
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Teacher profile not found");
    });

    test("should return 403 when teacher doesn't teach subject/grade", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });

      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "Teacher",
        subjectsTheyTeach: [],
        gradesTheyTeach: [],
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .post("/api/study-sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          lesson: "Math Class",
          subjectId: subject._id,
          gradeId: grade._id,
          date: "2025-12-20",
          startTime: "10:00",
          endTime: "11:00",
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("You can only create sessions");
    });

    test("should return 400 when end time is not after start time", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });

      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "Teacher",
        subjectsTheyTeach: [subject._id],
        gradesTheyTeach: [grade._id],
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .post("/api/study-sessions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          lesson: "Math Class",
          subjectId: subject._id,
          gradeId: grade._id,
          date: "2025-12-20",
          startTime: "11:00",
          endTime: "10:00",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("End time must be after start time");
    });
  });

  describe("PUT /api/study-sessions/:id", () => {
    test("should return 401 without token", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/api/study-sessions/${fakeId}`).send({ lesson: "Updated" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 when session not found", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const token = createToken(teacherUser);
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/study-sessions/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ lesson: "Updated" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should update session with allowed fields", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "Teacher",
        subjectsTheyTeach: [subject._id],
        gradesTheyTeach: [grade._id],
      });

      const session = await StudySession.create({
        lesson: "Original Lesson",
        subjectId: subject._id,
        gradeId: grade._id,
        teacherId: teacher._id,
        date: new Date(),
        startTime: "10:00",
        endTime: "11:00",
        notes: "Original notes",
        meetingLink: "https://zoom.us/j/123",
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .put(`/api/study-sessions/${session._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ lesson: "Updated Lesson", notes: "Updated notes" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lesson).toBe("Updated Lesson");
      expect(res.body.data.notes).toBe("Updated notes");
    });

    test("should not allow updating meeting link", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "Teacher",
        subjectsTheyTeach: [subject._id],
        gradesTheyTeach: [grade._id],
      });

      const session = await StudySession.create({
        lesson: "Math",
        subjectId: subject._id,
        gradeId: grade._id,
        teacherId: teacher._id,
        date: new Date(),
        startTime: "10:00",
        endTime: "11:00",
        meetingLink: "https://zoom.us/j/original",
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .put(`/api/study-sessions/${session._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          lesson: "Updated",
          meetingLink: "https://zoom.us/j/hacked",
        });

      expect(res.status).toBe(200);
      // Meeting link should not be updated
      expect(res.body.data.meetingLink).toBe("https://zoom.us/j/original");
    });
  });

  describe("DELETE /api/study-sessions/:id", () => {
    test("should return 401 without token", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/study-sessions/${fakeId}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 when session not found", async () => {
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const token = createToken(teacherUser);
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/study-sessions/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should delete session successfully", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Math" });
      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });
      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "Teacher",
      });

      const session = await StudySession.create({
        lesson: "To Delete",
        subjectId: subject._id,
        gradeId: grade._id,
        teacherId: teacher._id,
        date: new Date(),
        startTime: "10:00",
        endTime: "11:00",
        meetingLink: "https://zoom.us/j/123",
        meetingId: "123",
        zoomMeetingId: "456",
      });

      const token = createToken(teacherUser);

      const res = await request(app)
        .delete(`/api/study-sessions/${session._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("deleted successfully");

      // Verify deletion
      const deletedSession = await StudySession.findById(session._id);
      expect(deletedSession).toBeNull();
    });
  });

  describe("CRUD Flow Test", () => {
    test("should complete full CRUD operations for study sessions", async () => {
      const grade = await Grade.create({ gradeName: "Grade 10" });
      const subject = await Subject.create({ subjectName: "Science" });

      const teacherUser = await User.create({
        email: "teacher@test.com",
        password: "pass123",
        userType: "teacher",
        status: "active",
      });

      const teacher = await Teacher.create({
        userId: teacherUser._id,
        fullName: "Teacher",
        subjectsTheyTeach: [subject._id],
        gradesTheyTeach: [grade._id],
      });

      const token = createToken(teacherUser);

      // Note: Due to Zoom API mocking requirements, we'll skip CREATE for now
      // and focus on READ, UPDATE, DELETE on a pre-existing session

      const session = await StudySession.create({
        lesson: "Science Basics",
        subjectId: subject._id,
        gradeId: grade._id,
        teacherId: teacher._id,
        date: new Date(),
        startTime: "10:00",
        endTime: "11:00",
        meetingLink: "https://zoom.us/j/123",
      });

      // READ
      const readRes = await request(app).get(`/api/study-sessions/${session._id}`);
      expect(readRes.status).toBe(200);
      expect(readRes.body.data.lesson).toBe("Science Basics");

      // UPDATE
      const updateRes = await request(app)
        .put(`/api/study-sessions/${session._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ lesson: "Advanced Science", notes: "Advanced topics" });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.lesson).toBe("Advanced Science");

      // DELETE
      const deleteRes = await request(app)
        .delete(`/api/study-sessions/${session._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);

      // Verify deletion
      const verifyRes = await request(app).get(`/api/study-sessions/${session._id}`);
      expect(verifyRes.status).toBe(404);
    });
  });
});
