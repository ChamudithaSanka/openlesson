import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Student from "../../../models/studentRegModel.js";
import Teacher from "../../../models/teacher.model.js";
import Feedback from "../../../models/feedbackModel.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, userType: user.userType },
    process.env.JWT_SECRET
  );

// ── helpers ─────────────────────────────────────────────────
const createStudentWithToken = async (emailPrefix) => {
  const user = await User.create({
    email: `${emailPrefix}@test.com`,
    password: "pass123",
    userType: "student",
    status: "active",
  });
  const student = await Student.create({
    userId: user._id,
    fullName: `${emailPrefix} Student`,
    gradeId: new mongoose.Types.ObjectId(),
    schoolName: "Test School",
    district: "Colombo",
    status: "active",
  });
  return { user, student, token: createToken(user) };
};

const createTeacher = async (emailPrefix) => {
  const user = await User.create({
    email: `${emailPrefix}@test.com`,
    password: "pass123",
    userType: "teacher",
    status: "active",
  });
  const teacher = await Teacher.create({
    userId: user._id,
    fullName: `${emailPrefix} Teacher`,
    status: "Approved",
  });
  return { user, teacher };
};

const createAdminWithToken = async () => {
  const admin = await User.create({
    email: "admin@test.com",
    password: "pass123",
    userType: "admin",
    status: "active",
  });
  return { admin, token: createToken(admin) };
};

// ── suite ────────────────────────────────────────────────────
describe("Sonali - Feedback Routes Integration Tests", () => {
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

  // ──────────────────────────────────────────────────────────
  // POST /api/feedback
  // ──────────────────────────────────────────────────────────
  describe("POST /api/feedback", () => {
    test("should return 401 without token", async () => {
      const res = await request(app)
        .post("/api/feedback")
        .send({ teacherId: new mongoose.Types.ObjectId(), rating: 5, comment: "Great!" });

      expect(res.status).toBe(401);
    });

    test("should return 403 when admin tries to create feedback", async () => {
      const { token } = await createAdminWithToken();
      const { teacher } = await createTeacher("t0");

      const res = await request(app)
        .post("/api/feedback")
        .set("Authorization", `Bearer ${token}`)
        .send({ teacherId: teacher._id, rating: 5, comment: "Great!" });

      expect(res.status).toBe(403);
    });

    test("should return 403 when student profile is missing or inactive", async () => {
      const user = await User.create({
        email: "noprofile@test.com",
        password: "pass123",
        userType: "student",
        status: "active",
      });
      const token = createToken(user);
      const { teacher } = await createTeacher("t1");

      const res = await request(app)
        .post("/api/feedback")
        .set("Authorization", `Bearer ${token}`)
        .send({ teacherId: teacher._id, rating: 5, comment: "Great!" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/student account is inactive/i);
    });

    test("should create feedback successfully and return 201", async () => {
      const { token } = await createStudentWithToken("sf1");
      const { teacher } = await createTeacher("tf1");

      const res = await request(app)
        .post("/api/feedback")
        .set("Authorization", `Bearer ${token}`)
        .send({ teacherId: teacher._id, rating: 5, comment: "Excellent teacher!" });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/feedback created successfully/i);
      expect(res.body.feedback).toHaveProperty("_id");
      expect(res.body.feedback.rating).toBe(5);
    });

    test("should return 500 when rating is missing", async () => {
      const { token } = await createStudentWithToken("sf2");
      const { teacher } = await createTeacher("tf2");

      const res = await request(app)
        .post("/api/feedback")
        .set("Authorization", `Bearer ${token}`)
        .send({ teacherId: teacher._id, comment: "No rating here" });

      expect(res.status).toBe(500);
    });

    test("should return 500 when comment is missing", async () => {
      const { token } = await createStudentWithToken("sf3");
      const { teacher } = await createTeacher("tf3");

      const res = await request(app)
        .post("/api/feedback")
        .set("Authorization", `Bearer ${token}`)
        .send({ teacherId: teacher._id, rating: 4 });

      expect(res.status).toBe(500);
    });
  });

  // ──────────────────────────────────────────────────────────
  // GET /api/feedback  (admin only)
  // ──────────────────────────────────────────────────────────
  describe("GET /api/feedback", () => {
    test("should return 401 without token", async () => {
      const res = await request(app).get("/api/feedback");
      expect(res.status).toBe(401);
    });

    test("should return 403 when student accesses all feedback", async () => {
      const { token } = await createStudentWithToken("sf4");

      const res = await request(app)
        .get("/api/feedback")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    test("should return empty array when no feedback exists", async () => {
      const { token } = await createAdminWithToken();

      const res = await request(app)
        .get("/api/feedback")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.feedbacks).toEqual([]);
    });

    test("should return all feedback records for admin", async () => {
      const { student } = await createStudentWithToken("sf5");
      const { teacher } = await createTeacher("tf4");
      const { token: adminToken } = await createAdminWithToken();

      await Feedback.create([
        { studentId: student._id, teacherId: teacher._id, rating: 5, comment: "Excellent" },
        { studentId: student._id, teacherId: teacher._id, rating: 3, comment: "Average" },
      ]);

      const res = await request(app)
        .get("/api/feedback")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.feedbacks).toHaveLength(2);
    });
  });

  // ──────────────────────────────────────────────────────────
  // GET /api/feedback/:id
  // ──────────────────────────────────────────────────────────
  describe("GET /api/feedback/:id", () => {
    test("should return 404 for non-existent feedback ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app).get(`/api/feedback/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/feedback not found/i);
    });
    

    test("should return feedback by valid ID", async () => {
      const { student } = await createStudentWithToken("sf6");
      const { teacher } = await createTeacher("tf5");

      const feedback = await Feedback.create({
        studentId: student._id,
        teacherId: teacher._id,
        rating: 4,
        comment: "Good class",
      });

      const res = await request(app).get(`/api/feedback/${feedback._id}`);

      expect(res.status).toBe(200);
      expect(res.body.feedback._id).toBe(String(feedback._id));
      expect(res.body.feedback.comment).toBe("Good class");
    });
  });

  // GET /api/feedback/student/:studentId
  // ──────────────────────────────────────────────────────────
  describe("GET /api/feedback/student/:studentId", () => {
    test("should return empty array when student has no feedback", async () => {
      const { student } = await createStudentWithToken("sf7");

      const res = await request(app).get(`/api/feedback/student/${student._id}`);

      expect(res.status).toBe(200);
      expect(res.body.feedbacks).toEqual([]);
    });

    test("should return all feedback for a specific student", async () => {
      const { student } = await createStudentWithToken("sf8");
      const { teacher } = await createTeacher("tf6");

      await Feedback.create([
        { studentId: student._id, teacherId: teacher._id, rating: 5, comment: "Great" },
        { studentId: student._id, teacherId: teacher._id, rating: 2, comment: "Poor" },
      ]);

      const res = await request(app).get(`/api/feedback/student/${student._id}`);

      expect(res.status).toBe(200);
      expect(res.body.feedbacks).toHaveLength(2);
    });

    test("should not return another student's feedback", async () => {
      const { student: student1 } = await createStudentWithToken("sf9");
      const { student: student2 } = await createStudentWithToken("sf10");
      const { teacher } = await createTeacher("tf7");

      await Feedback.create({
        studentId: student2._id,
        teacherId: teacher._id,
        rating: 5,
        comment: "Not for student1",
      });

      const res = await request(app).get(`/api/feedback/student/${student1._id}`);

      expect(res.status).toBe(200);
      expect(res.body.feedbacks).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────────────────
  // PUT /api/feedback/:id
  // ──────────────────────────────────────────────────────────
  describe("PUT /api/feedback/:id", () => {
    test("should update feedback rating and comment", async () => {
      const { student } = await createStudentWithToken("sf11");
      const { teacher } = await createTeacher("tf8");

      const feedback = await Feedback.create({
        studentId: student._id,
        teacherId: teacher._id,
        rating: 3,
        comment: "Average",
      });

      const res = await request(app)
        .put(`/api/feedback/${feedback._id}`)
        .send({ rating: 5, comment: "Actually excellent!" });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/feedback updated/i);
      expect(res.body.feedback.rating).toBe(5);
      expect(res.body.feedback.comment).toBe("Actually excellent!");
    });
  });

  // ──────────────────────────────────────────────────────────
  // DELETE /api/feedback/:id  (admin only)
  // ──────────────────────────────────────────────────────────
  describe("DELETE /api/feedback/:id", () => {
    test("should return 401 without token", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/feedback/${fakeId}`);
      expect(res.status).toBe(401);
    });

    test("should return 403 when student tries to delete feedback", async () => {
      const { student, token } = await createStudentWithToken("sf12");
      const { teacher } = await createTeacher("tf9");

      const feedback = await Feedback.create({
        studentId: student._id,
        teacherId: teacher._id,
        rating: 4,
        comment: "Good",
      });

      const res = await request(app)
        .delete(`/api/feedback/${feedback._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    test("should delete feedback successfully as admin", async () => {
      const { student } = await createStudentWithToken("sf13");
      const { teacher } = await createTeacher("tf10");
      const { token: adminToken } = await createAdminWithToken();

      const feedback = await Feedback.create({
        studentId: student._id,
        teacherId: teacher._id,
        rating: 4,
        comment: "To be deleted",
      });

      const res = await request(app)
        .delete(`/api/feedback/${feedback._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/feedback deleted/i);

      const inDb = await Feedback.findById(feedback._id);
      expect(inDb).toBeNull();
    });

    test("should return 200 even for non-existent feedback (no guard in controller)", async () => {
      const { token: adminToken } = await createAdminWithToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/feedback/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
