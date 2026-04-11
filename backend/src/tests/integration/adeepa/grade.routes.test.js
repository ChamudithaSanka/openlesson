import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Grade from "../../../models/grade.model.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, userType: user.userType }, process.env.JWT_SECRET);

describe("Adeepa - Grade Routes Integration Tests", () => {
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

  test("GET /api/grades should return all grades without auth", async () => {
    await Grade.create({ gradeName: "Grade 1", description: "First Grade" });

    const res = await request(app).get("/api/grades");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].gradeName).toBe("Grade 1");
  });

  test("GET /api/grades/:id should return grade by ID", async () => {
    const grade = await Grade.create({ gradeName: "Grade 2", description: "Second Grade" });

    const res = await request(app).get(`/api/grades/${grade._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.gradeName).toBe("Grade 2");
  });

  test("GET /api/grades/:id should return 404 for missing grade", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/grades/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Grade not found");
  });

  test("POST /api/grades should require authentication", async () => {
    const res = await request(app)
      .post("/api/grades")
      .send({ gradeName: "New Grade", description: "Test" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/grades should require admin role", async () => {
    const user = await User.create({ email: "user@test.com", password: "pass123", userType: "student", status: "active" });
    const token = createToken(user);

    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${token}`)
      .send({ gradeName: "New Grade", description: "Test" });

    expect(res.status).toBe(403);
  });

  test("POST /api/grades should create grade for admin", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const token = createToken(admin);

    const res = await request(app)
      .post("/api/grades")
      .set("Authorization", `Bearer ${token}`)
      .send({ gradeName: "New Grade", description: "Test Description" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.gradeName).toBe("New Grade");
  });

  test("PUT /api/grades/:id should require admin role", async () => {
    const user = await User.create({ email: "user@test.com", password: "pass123", userType: "student", status: "active" });
    const token = createToken(user);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/grades/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ gradeName: "Updated" });

    expect(res.status).toBe(403);
  });

  test("PUT /api/grades/:id should update grade for admin", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const grade = await Grade.create({ gradeName: "Grade 3", description: "Testing" });
    const token = createToken(admin);

    const res = await request(app)
      .put(`/api/grades/${grade._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ gradeName: "Grade 3 Updated" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.gradeName).toBe("Grade 3 Updated");
  });

  test("PUT /api/grades/:id should return 404 for missing grade", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const token = createToken(admin);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/grades/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ gradeName: "Updated" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("DELETE /api/grades/:id should require admin role", async () => {
    const user = await User.create({ email: "user@test.com", password: "pass123", userType: "student", status: "active" });
    const token = createToken(user);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/grades/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test("DELETE /api/grades/:id should delete grade for admin", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const grade = await Grade.create({ gradeName: "To Delete", description: "Test" });
    const token = createToken(admin);

    const res = await request(app)
      .delete(`/api/grades/${grade._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await Grade.findById(grade._id);
    expect(deleted).toBeNull();
  });
});
