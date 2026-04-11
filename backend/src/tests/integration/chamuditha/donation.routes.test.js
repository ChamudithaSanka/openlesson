import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Donor from "../../../models/donor.model.js";
import Donation from "../../../models/donation.model.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, userType: user.userType }, process.env.JWT_SECRET);

describe("Chamuditha - Donation Routes Integration Tests", () => {
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

  test("POST /api/donations should create donation for donor", async () => {
    const user = await User.create({ email: "donor1@test.com", password: "pass123", userType: "donor", status: "active" });
    const donor = await Donor.create({ userId: user._id, fullName: "Donor One", email: "donor1@test.com", status: "Active" });
    const token = createToken(user);

    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 1000, paymentMethod: "Card", message: "For students" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.donation.donorId).toBe(donor._id.toString());
  });

  test("POST /api/donations should return 401 without token", async () => {
    const res = await request(app).post("/api/donations").send({ amount: 1000, paymentMethod: "Card" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/donations should allow admin to list donations", async () => {
    const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
    const donorUser = await User.create({ email: "donor2@test.com", password: "pass123", userType: "donor", status: "active" });
    const donor = await Donor.create({ userId: donorUser._id, fullName: "Donor Two", email: "donor2@test.com", status: "Active" });
    await Donation.create({ donorId: donor._id, amount: 1200, paymentMethod: "Card", paymentStatus: "Pending" });

    const token = createToken(admin);
    const res = await request(app).get("/api/donations").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
  });

  test("DELETE /api/donations/:id should block donor deleting another donor donation", async () => {
    const ownerUser = await User.create({ email: "owner@test.com", password: "pass123", userType: "donor", status: "active" });
    const ownerDonor = await Donor.create({ userId: ownerUser._id, fullName: "Owner", email: "owner@test.com", status: "Active" });
    const donation = await Donation.create({ donorId: ownerDonor._id, amount: 800, paymentMethod: "Card", paymentStatus: "Pending" });

    const otherUser = await User.create({ email: "other@test.com", password: "pass123", userType: "donor", status: "active" });
    await Donor.create({ userId: otherUser._id, fullName: "Other", email: "other@test.com", status: "Active" });
    const otherToken = createToken(otherUser);

    const res = await request(app)
      .delete(`/api/donations/${donation._id}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/donations should return 500 on invalid payload", async () => {
    const user = await User.create({ email: "donor3@test.com", password: "pass123", userType: "donor", status: "active" });
    await Donor.create({ userId: user._id, fullName: "Donor Three", email: "donor3@test.com", status: "Active" });
    const token = createToken(user);

    const res = await request(app)
      .post("/api/donations")
      .set("Authorization", `Bearer ${token}`)
      .send({ paymentMethod: "Card" });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
