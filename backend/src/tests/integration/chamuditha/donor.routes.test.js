import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Donor from "../../../models/donor.model.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, userType: user.userType }, process.env.JWT_SECRET);

describe("Chamuditha - Donor Routes Integration Tests", () => {
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

  test("GET /api/donors/profile/:id should allow owner donor", async () => {
    const user = await User.create({ email: "ownerdonor@test.com", password: "pass123", userType: "donor", status: "active" });
    const donor = await Donor.create({ userId: user._id, fullName: "Owner Donor", email: "ownerdonor@test.com", status: "Active" });
    const token = createToken(user);

    const res = await request(app)
      .get(`/api/donors/profile/${donor._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/donors/profile/:id should block non-owner donor", async () => {
    const ownerUser = await User.create({ email: "owner2@test.com", password: "pass123", userType: "donor", status: "active" });
    const ownerDonor = await Donor.create({ userId: ownerUser._id, fullName: "Owner 2", email: "owner2@test.com", status: "Active" });

    const otherUser = await User.create({ email: "other2@test.com", password: "pass123", userType: "donor", status: "active" });
    await Donor.create({ userId: otherUser._id, fullName: "Other 2", email: "other2@test.com", status: "Active" });
    const token = createToken(otherUser);

    const res = await request(app)
      .get(`/api/donors/profile/${ownerDonor._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("PUT /api/donors/subscription/:id should validate recurringPlan", async () => {
    const user = await User.create({ email: "plan@test.com", password: "pass123", userType: "donor", status: "active" });
    const donor = await Donor.create({ userId: user._id, fullName: "Plan Donor", email: "plan@test.com", status: "Active" });
    const token = createToken(user);

    const res = await request(app)
      .put(`/api/donors/subscription/${donor._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ recurringPlan: "weekly", recurringAmount: 1000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("PATCH /api/donors/subscription/:id/toggle should validate enabled boolean", async () => {
    const user = await User.create({ email: "toggle@test.com", password: "pass123", userType: "donor", status: "active" });
    const donor = await Donor.create({ userId: user._id, fullName: "Toggle Donor", email: "toggle@test.com", status: "Active" });
    const token = createToken(user);

    const res = await request(app)
      .patch(`/api/donors/subscription/${donor._id}/toggle`)
      .set("Authorization", `Bearer ${token}`)
      .send({ enabled: "true" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/donors should reject non-admin user", async () => {
    const user = await User.create({ email: "notadmin@test.com", password: "pass123", userType: "donor", status: "active" });
    await Donor.create({ userId: user._id, fullName: "Not Admin", email: "notadmin@test.com", status: "Active" });
    const token = createToken(user);

    const res = await request(app).get("/api/donors").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
