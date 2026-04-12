import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Student from "../../../models/studentRegModel.js";
import Complaint from "../../../models/Complaintmodel.js";


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
    fullName: `${emailPrefix} Test`,
    gradeId: new mongoose.Types.ObjectId(),
    schoolName: "Test School",
    district: "Colombo",
    status: "active",
  });
  return { user, student, token: createToken(user) };
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
describe("Sonali - Complaint Routes Integration Tests", () => {
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

  // POST /api/complaints
  // ──────────────────────────────────────────────────────────
  describe("POST /api/complaints", () => {
    test("should return 401 without token", async () => {
      const res = await request(app)
        .post("/api/complaints")
        .send({ subject: "Issue", description: "Something broke" });

      expect(res.status).toBe(401);
    });

    test("should return 400 when subject is missing", async () => {
      const { token } = await createStudentWithToken("s1");

      const res = await request(app)
        .post("/api/complaints")
        .set("Authorization", `Bearer ${token}`)
        .send({ description: "Something broke" });

      expect(res.status).toBe(400);
    });

    test("should return 400 when description is missing", async () => {
      const { token } = await createStudentWithToken("s2");

      const res = await request(app)
        .post("/api/complaints")
        .set("Authorization", `Bearer ${token}`)
        .send({ subject: "Login issue" });

      expect(res.status).toBe(400);
    });

    test("should return 403 when user has no student profile", async () => {
      const user = await User.create({
        email: "noprofile@test.com",
        password: "pass123",
        userType: "student",
        status: "active",
      });
      const token = createToken(user);

      const res = await request(app)
        .post("/api/complaints")
        .set("Authorization", `Bearer ${token}`)
        .send({ subject: "Issue", description: "Details" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/student account is inactive/i);
    });

    test("should create complaint successfully and return 201", async () => {
      const { token } = await createStudentWithToken("s3");

      const res = await request(app)
        .post("/api/complaints")
        .set("Authorization", `Bearer ${token}`)
        .send({ subject: "Video issue", description: "Cannot load videos" });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/complaint submitted successfully/i);
      expect(res.body.complaint).toHaveProperty("_id");
    });

    test("should assign High priority when 'not working' in text", async () => {
      const { token } = await createStudentWithToken("s4");

      const res = await request(app)
        .post("/api/complaints")
        .set("Authorization", `Bearer ${token}`)
        .send({ subject: "App not working", description: "It is not working" });

      expect(res.status).toBe(201);
      expect(res.body.complaint.priority).toBe("High");
    });

    test("should assign Low priority when 'slow' in text", async () => {
      const { token } = await createStudentWithToken("s5");

      const res = await request(app)
        .post("/api/complaints")
        .set("Authorization", `Bearer ${token}`)
        .send({ subject: "Video slow", description: "Loading is very slow" });

      expect(res.status).toBe(201);
      expect(res.body.complaint.priority).toBe("Low");
    });

    test("should return 403 when admin tries to create complaint", async () => {
      const { token } = await createAdminWithToken();

      const res = await request(app)
        .post("/api/complaints")
        .set("Authorization", `Bearer ${token}`)
        .send({ subject: "Test", description: "Admin trying" });

      expect(res.status).toBe(403);
    });
  });

  // ──────────────────────────────────────────────────────────
  // GET /api/complaints/my-complaints
  // ──────────────────────────────────────────────────────────
  describe("GET /api/complaints/my-complaints", () => {
    test("should return 401 without token", async () => {
      const res = await request(app).get("/api/complaints/my-complaints");
      expect(res.status).toBe(401);
    });

    test("should return 403 when user has no student profile", async () => {
      const user = await User.create({
        email: "ghost@test.com",
        password: "pass123",
        userType: "student",
        status: "active",
      });
      const token = createToken(user);

      const res = await request(app)
        .get("/api/complaints/my-complaints")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    test("should return empty array when student has no complaints", async () => {
      const { token } = await createStudentWithToken("s6");

      const res = await request(app)
        .get("/api/complaints/my-complaints")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test("should return only the logged-in student's complaints", async () => {
      const { student, token } = await createStudentWithToken("s7");
      const { student: otherStudent } = await createStudentWithToken("s8");

      await Complaint.create({
        studentId: student._id,
        subject: "My complaint",
        description: "Details",
        category: "Other",
        priority: "Medium",
      });
      await Complaint.create({
        studentId: otherStudent._id,
        subject: "Not mine",
        description: "Other details",
        category: "Other",
        priority: "Medium",
      });

      const res = await request(app)
        .get("/api/complaints/my-complaints")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].subject).toBe("My complaint");
    });
  });

  // ──────────────────────────────────────────────────────────
  // PUT /api/complaints/:id
  // ──────────────────────────────────────────────────────────
  describe("PUT /api/complaints/:id", () => {
    test("should return 401 without token", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/complaints/${fakeId}`)
        .send({ subject: "Updated", description: "Updated desc" });

      expect(res.status).toBe(401);
    });

    test("should return 404 when complaint not found", async () => {
      const { token } = await createStudentWithToken("s9");
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/complaints/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ subject: "Updated", description: "Updated desc" });

      expect(res.status).toBe(404);
    });

    test("should return 403 when student updates another student's complaint", async () => {
      const { student: owner } = await createStudentWithToken("s10");
      const { token: otherToken } = await createStudentWithToken("s11");

      const complaint = await Complaint.create({
        studentId: owner._id,
        subject: "Owner complaint",
        description: "Owner details",
        category: "Other",
        priority: "Medium",
        status: "Open",
      });

      const res = await request(app)
        .put(`/api/complaints/${complaint._id}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ subject: "Hacked", description: "Hacked desc" });

      expect(res.status).toBe(403);
    });

    test("should return 400 when complaint is not Open", async () => {
      const { student, token } = await createStudentWithToken("s12");

      const complaint = await Complaint.create({
        studentId: student._id,
        subject: "Resolved complaint",
        description: "Already resolved",
        category: "Other",
        priority: "Medium",
        status: "Resolved",
      });

      const res = await request(app)
        .put(`/api/complaints/${complaint._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ subject: "Try to edit", description: "Try desc" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/can only be edited while it is open/i);
    });

    test("should update complaint subject successfully", async () => {
      const { student, token } = await createStudentWithToken("s13");

      const complaint = await Complaint.create({
        studentId: student._id,
        subject: "Original subject",
        description: "Original description",
        category: "Other",
        priority: "Medium",
        status: "Open",
      });

      const res = await request(app)
        .put(`/api/complaints/${complaint._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ subject: "Updated subject", description: "Original description" });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/complaint updated successfully/i);
      expect(res.body.complaint.subject).toBe("Updated subject");
    });
  });

  // ──────────────────────────────────────────────────────────
  // DELETE /api/complaints/:id
  // ──────────────────────────────────────────────────────────
  describe("DELETE /api/complaints/:id", () => {
    test("should return 401 without token", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app).delete(`/api/complaints/${fakeId}`);

      expect(res.status).toBe(401);
    });

    test("should return 404 when complaint not found", async () => {
      const { token } = await createStudentWithToken("s14");
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/complaints/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    test("should return 403 when deleting another student's complaint", async () => {
      const { student: owner } = await createStudentWithToken("s15");
      const { token: otherToken } = await createStudentWithToken("s16");

      const complaint = await Complaint.create({
        studentId: owner._id,
        subject: "Not mine",
        description: "Details",
        category: "Other",
        priority: "Medium",
      });

      const res = await request(app)
        .delete(`/api/complaints/${complaint._id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });

    test("should delete own complaint successfully", async () => {
      const { student, token } = await createStudentWithToken("s17");

      const complaint = await Complaint.create({
        studentId: student._id,
        subject: "To delete",
        description: "Please delete me",
        category: "Other",
        priority: "Medium",
      });

      const res = await request(app)
        .delete(`/api/complaints/${complaint._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/complaint deleted successfully/i);

      const inDb = await Complaint.findById(complaint._id);
      expect(inDb).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────
  // GET /api/complaints/admin/all
  // ──────────────────────────────────────────────────────────
  describe("GET /api/complaints/admin/all", () => {
    test("should return 403 when student accesses admin route", async () => {
      const { token } = await createStudentWithToken("s18");

      const res = await request(app)
        .get("/api/complaints/admin/all")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    test("should return all complaints for admin", async () => {
      const { student } = await createStudentWithToken("s19");
      const { token: adminToken } = await createAdminWithToken();

      await Complaint.create([
        { studentId: student._id, subject: "A", description: "D1", category: "Other", priority: "Medium" },
        { studentId: student._id, subject: "B", description: "D2", category: "Login Issue", priority: "High" },
      ]);

      const res = await request(app)
        .get("/api/complaints/admin/all")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });
  });

  // ──────────────────────────────────────────────────────────
  // PUT /api/complaints/admin/:id/status
  // ──────────────────────────────────────────────────────────
  describe("PUT /api/complaints/admin/:id/status", () => {
    test("should return 400 for invalid status value", async () => {
      const { student } = await createStudentWithToken("s20");
      const { token: adminToken } = await createAdminWithToken();

      const complaint = await Complaint.create({
        studentId: student._id,
        subject: "S",
        description: "D",
        category: "Other",
        priority: "Medium",
      });

      const res = await request(app)
        .put(`/api/complaints/admin/${complaint._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "Banana" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should update complaint status successfully", async () => {
      const { student } = await createStudentWithToken("s21");
      const { token: adminToken } = await createAdminWithToken();

      const complaint = await Complaint.create({
        studentId: student._id,
        subject: "Open complaint",
        description: "Details",
        category: "Other",
        priority: "Medium",
        status: "Open",
      });

      const res = await request(app)
        .put(`/api/complaints/admin/${complaint._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "Under Review" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.complaint.status).toBe("Under Review");
    });
  });
});
