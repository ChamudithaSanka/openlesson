import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Subject from "../../../models/subject.model.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, userType: user.userType }, process.env.JWT_SECRET);

describe("Adeepa - Subject Routes Integration Tests", () => {
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

  test("GET /api/subjects should return all subjects without auth", async () => {
    await Subject.create({ subjectName: "Math", description: "Mathematics" });

    const res = await request(app).get("/api/subjects");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].subjectName).toBe("Math");
  });

  test("GET /api/subjects/:id should return subject by ID", async () => {
    const subject = await Subject.create({ subjectName: "English", description: "English Language" });

    const res = await request(app).get(`/api/subjects/${subject._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subjectName).toBe("English");
  });

  test("GET /api/subjects/:id should return 404 for missing subject", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/subjects/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Subject not found");
  });

  test("POST /api/subjects should require authentication", async () => {
    const res = await request(app)
      .post("/api/subjects")
      .send({ subjectName: "Science", description: "Science" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/subjects should require admin role", async () => {
    const user = await User.create({ email: "user@test.com", password: "pass123", userType: "student", status: "active" });
    const token = createToken(user);

    const res = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${token}`)
      .send({ subjectName: "Science", description: "Science" });

    expect(res.status).toBe(403);
  });

  test("POST /api/subjects should create subject for admin", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const token = createToken(admin);

    const res = await request(app)
      .post("/api/subjects")
      .set("Authorization", `Bearer ${token}`)
      .send({ subjectName: "History", description: "World History" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subjectName).toBe("History");
  });

  test("PUT /api/subjects/:id should require admin role", async () => {
    const user = await User.create({ email: "user@test.com", password: "pass123", userType: "student", status: "active" });
    const token = createToken(user);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/subjects/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ subjectName: "Updated" });

    expect(res.status).toBe(403);
  });

  test("PUT /api/subjects/:id should update subject for admin", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const subject = await Subject.create({ subjectName: "Physics", description: "Physics" });
    const token = createToken(admin);

    const res = await request(app)
      .put(`/api/subjects/${subject._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ subjectName: "Physics Advanced" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subjectName).toBe("Physics Advanced");
  });

  test("PUT /api/subjects/:id should return 404 for missing subject", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const token = createToken(admin);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/subjects/${fakeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ subjectName: "Updated" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("DELETE /api/subjects/:id should require admin role", async () => {
    const user = await User.create({ email: "user@test.com", password: "pass123", userType: "student", status: "active" });
    const token = createToken(user);
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/subjects/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test("DELETE /api/subjects/:id should delete subject for admin", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const subject = await Subject.create({ subjectName: "Chemistry", description: "Chemistry" });
    const token = createToken(admin);

    const res = await request(app)
      .delete(`/api/subjects/${subject._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const deleted = await Subject.findById(subject._id);
    expect(deleted).toBeNull();
  });
});
