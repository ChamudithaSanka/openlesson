import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Student from "../../../models/studentRegModel.js";
import Grade from "../../../models/grade.model.js";


let mongoServer;

const createToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, userType: user.userType },
    process.env.JWT_SECRET
  );

// ── helpers ─────────────────────────────────────────────────
const createStudentWithToken = async (emailPrefix) => {
  const grade = await Grade.create({ gradeName: `Grade-${emailPrefix}`, description: "Test grade" });
  const user = await User.create({
    email: `${emailPrefix}@test.com`,
    password: "pass123",
    userType: "student",
    status: "active",
  });
  const student = await Student.create({
    userId: user._id,
    fullName: `${emailPrefix} Student`,
    gradeId: grade._id,
    schoolName: "Test School",
    district: "Colombo",
    phone: "0771234567",
    status: "active",
  });
  return { user, student, grade, token: createToken(user) };
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
describe("Sonali - Student Routes Integration Tests", () => {
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

  // GET /api/students/my-profile
  // ──────────────────────────────────────────────────────────
  describe("GET /api/students/my-profile", () => {
    test("should return 401 without token", async () => {
      const res = await request(app).get("/api/students/my-profile");
      expect(res.status).toBe(401);
    });

    test("should return 403 when student profile does not exist", async () => {
      const user = await User.create({
        email: "noprofile@test.com",
        password: "pass123",
        userType: "student",
        status: "active",
      });
      const token = createToken(user);

      const res = await request(app)
        .get("/api/students/my-profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/student account is inactive/i);
    });

    test("should return own student profile for logged-in student", async () => {
      const { token } = await createStudentWithToken("ss1");

      const res = await request(app)
        .get("/api/students/my-profile")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.student.fullName).toBe("ss1 Student");
    });
  });

  // ──────────────────────────────────────────────────────────
  // PUT /api/students/my-profile
  // ──────────────────────────────────────────────────────────
  describe("PUT /api/students/my-profile", () => {
    test("should return 401 without token", async () => {
      const res = await request(app)
        .put("/api/students/my-profile")
        .send({ fullName: "Updated" });

      expect(res.status).toBe(401);
    });

    test("should return 403 when student profile does not exist", async () => {
      const user = await User.create({
        email: "noprofile2@test.com",
        password: "pass123",
        userType: "student",
        status: "active",
      });
      const token = createToken(user);

      const res = await request(app)
        .put("/api/students/my-profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Updated Name" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/student account is inactive/i);
    });

    test("should update fullName successfully", async () => {
      const { token } = await createStudentWithToken("ss2");

      const res = await request(app)
        .put("/api/students/my-profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Sonali Updated" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.student.fullName).toBe("Sonali Updated");
    });

    test("should NOT allow student to update gradeId (protected field)", async () => {
      const { student, token } = await createStudentWithToken("ss3");
      const originalGradeId = String(student.gradeId);

      const res = await request(app)
        .put("/api/students/my-profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ gradeId: new mongoose.Types.ObjectId() });

      expect(res.status).toBe(200);
      const updated = await Student.findById(student._id);
      expect(String(updated.gradeId)).toBe(originalGradeId);
    });
  });

  // ──────────────────────────────────────────────────────────
  // GET /api/students/profile/:id
  // ──────────────────────────────────────────────────────────
  describe("GET /api/students/profile/:id", () => {
    test("should return 401 without token", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/students/profile/${fakeId}`);
      expect(res.status).toBe(401);
    });

    test("should return 404 when student not found", async () => {
      const { token } = await createStudentWithToken("ss4");
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/students/profile/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    test("should return 403 when non-owner student views another profile", async () => {
      const { student: owner } = await createStudentWithToken("ss5");
      const { token: otherToken } = await createStudentWithToken("ss6");

      const res = await request(app)
        .get(`/api/students/profile/${owner._id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });

    test("should return profile for the owner student", async () => {
      const { student, token } = await createStudentWithToken("ss7");

      const res = await request(app)
        .get(`/api/students/profile/${student._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.student._id).toBe(String(student._id));
    });

    test("admin can view any student profile", async () => {
      const { student } = await createStudentWithToken("ss8");
      const { token: adminToken } = await createAdminWithToken();

      const res = await request(app)
        .get(`/api/students/profile/${student._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.student._id).toBe(String(student._id));
    });
  });

  // ──────────────────────────────────────────────────────────
  // GET /api/students/admin/all
  // ──────────────────────────────────────────────────────────
  describe("GET /api/students/admin/all", () => {
    test("should return 403 when student accesses admin route", async () => {
      const { token } = await createStudentWithToken("ss9");

      const res = await request(app)
        .get("/api/students/admin/all")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    test("should return empty list when no students exist", async () => {
      const { token: adminToken } = await createAdminWithToken();

      const res = await request(app)
        .get("/api/students/admin/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.students).toEqual([]);
    });

    test("should return all students for admin", async () => {
      await createStudentWithToken("ss10");
      await createStudentWithToken("ss11");
      const { token: adminToken } = await createAdminWithToken();

      const res = await request(app)
        .get("/api/students/admin/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });
  });

  // ──────────────────────────────────────────────────────────
  // PUT /api/students/admin/:id/status
  // ──────────────────────────────────────────────────────────
  describe("PUT /api/students/admin/:id/status", () => {
    test("should return 403 when student tries to update status", async () => {
      const { student, token } = await createStudentWithToken("ss12");

      const res = await request(app)
        .put(`/api/students/admin/${student._id}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "inactive" });

      expect(res.status).toBe(403);
    });

    test("should return 400 for invalid status value", async () => {
      const { student } = await createStudentWithToken("ss13");
      const { token: adminToken } = await createAdminWithToken();

      const res = await request(app)
        .put(`/api/students/admin/${student._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "suspended" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid status/i);
    });

    test("should return 404 when student not found", async () => {
      const { token: adminToken } = await createAdminWithToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/students/admin/${fakeId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "inactive" });

      expect(res.status).toBe(404);
    });

    test("should set student status to inactive", async () => {
      const { student } = await createStudentWithToken("ss14");
      const { token: adminToken } = await createAdminWithToken();

      const res = await request(app)
        .put(`/api/students/admin/${student._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "inactive" });

      expect(res.status).toBe(200);
      expect(res.body.student.status).toBe("inactive");
    });

    test("should set student status back to active", async () => {
      const { student } = await createStudentWithToken("ss15");
      const { token: adminToken } = await createAdminWithToken();
      await Student.findByIdAndUpdate(student._id, { status: "inactive" });

      const res = await request(app)
        .put(`/api/students/admin/${student._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "active" });

      expect(res.status).toBe(200);
      expect(res.body.student.status).toBe("active");
    });
  });

  // ──────────────────────────────────────────────────────────
  // PUT /api/students/admin/:id
  // ──────────────────────────────────────────────────────────
  describe("PUT /api/students/admin/:id", () => {
    test("should return 403 when student uses admin update route", async () => {
      const { student, token } = await createStudentWithToken("ss16");

      const res = await request(app)
        .put(`/api/students/admin/${student._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Hacked Name" });

      expect(res.status).toBe(403);
    });

    test("should return 404 when student not found", async () => {
      const { token: adminToken } = await createAdminWithToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/students/admin/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ fullName: "Ghost" });

      expect(res.status).toBe(404);
    });

    test("should update student details as admin", async () => {
      const { student } = await createStudentWithToken("ss17");
      const { token: adminToken } = await createAdminWithToken();

      const res = await request(app)
        .put(`/api/students/admin/${student._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ fullName: "Admin Updated Name", schoolName: "New School" });

      expect(res.status).toBe(200);
      expect(res.body.student.fullName).toBe("Admin Updated Name");
      expect(res.body.student.schoolName).toBe("New School");
    });
  });

  // ──────────────────────────────────────────────────────────
  // DELETE /api/students/admin/:id
  // ──────────────────────────────────────────────────────────
  describe("DELETE /api/students/admin/:id", () => {
    test("should return 403 when student tries to delete via admin route", async () => {
      const { student, token } = await createStudentWithToken("ss18");

      const res = await request(app)
        .delete(`/api/students/admin/${student._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    test("should return 404 when student not found", async () => {
      const { token: adminToken } = await createAdminWithToken();
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/students/admin/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    test("should delete student and their user account", async () => {
      const { user, student } = await createStudentWithToken("ss19");
      const { token: adminToken } = await createAdminWithToken();

      const res = await request(app)
        .delete(`/api/students/admin/${student._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/student deleted successfully/i);

      const deletedStudent = await Student.findById(student._id);
      const deletedUser = await User.findById(user._id);
      expect(deletedStudent).toBeNull();
      expect(deletedUser).toBeNull();
    });
  });
});
