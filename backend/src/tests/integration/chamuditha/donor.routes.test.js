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

const createDonorUser = async (email) => {
  const user = await User.create({ email, password: "pass123", userType: "donor", status: "active" });
  const donor = await Donor.create({ userId: user._id, fullName: "Donor User", email, status: "Active" });
  return { user, donor, token: createToken(user) };
};

const createAdminUser = async (email = "admin@test.com") => {
  const user = await User.create({ email, password: "pass123", userType: "admin", status: "active" });
  return { user, token: createToken(user) };
};

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

  describe("GET /api/donors/profile/:id", () => {
    test("should allow owner donor", async () => {
      const { donor, token } = await createDonorUser("ownerdonor@test.com");

      const res = await request(app)
        .get(`/api/donors/profile/${donor._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.donor).toBeDefined();
    });

    test("should allow admin to view donor profile", async () => {
      const { donor } = await createDonorUser("admintarget@test.com");
      const { token } = await createAdminUser();

      const res = await request(app)
        .get(`/api/donors/profile/${donor._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("should block non-owner donor", async () => {
      const owner = await createDonorUser("owner2@test.com");
      const other = await createDonorUser("other2@test.com");

      const res = await request(app)
        .get(`/api/donors/profile/${owner.donor._id}`)
        .set("Authorization", `Bearer ${other.token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 for missing donor", async () => {
      const { token } = await createAdminUser();

      const res = await request(app)
        .get(`/api/donors/profile/${new mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("should return 401 without token", async () => {
      const { donor } = await createDonorUser("notoken@test.com");

      const res = await request(app).get(`/api/donors/profile/${donor._id}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/donors/profile/:id", () => {
    test("should update profile for owner donor", async () => {
      const { donor, token } = await createDonorUser("updateowner@test.com");

      const res = await request(app)
        .put(`/api/donors/profile/${donor._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Updated Owner", city: "Colombo" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.donor.fullName).toBe("Updated Owner");
    });

    test("should block non-owner donor", async () => {
      const owner = await createDonorUser("updateowner2@test.com");
      const other = await createDonorUser("updateother2@test.com");

      const res = await request(app)
        .put(`/api/donors/profile/${owner.donor._id}`)
        .set("Authorization", `Bearer ${other.token}`)
        .send({ fullName: "No Access" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test("should return 400 for duplicate email", async () => {
      const owner = await createDonorUser("dup-owner@test.com");
      await createDonorUser("dup-existing@test.com");

      const res = await request(app)
        .put(`/api/donors/profile/${owner.donor._id}`)
        .set("Authorization", `Bearer ${owner.token}`)
        .send({ email: "dup-existing@test.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should return 404 for missing donor", async () => {
      const { token } = await createDonorUser("missingupdate@test.com");

      const res = await request(app)
        .put(`/api/donors/profile/${new mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Missing" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PUT /api/donors/subscription/:id", () => {
    test("should update subscription for owner donor", async () => {
      const { donor, token } = await createDonorUser("plan-ok@test.com");

      const res = await request(app)
        .put(`/api/donors/subscription/${donor._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ recurringPlan: "monthly", recurringAmount: 1000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.donor.recurringPlan).toBe("monthly");
    });

    test("should validate recurringPlan", async () => {
      const { donor, token } = await createDonorUser("plan@test.com");

      const res = await request(app)
        .put(`/api/donors/subscription/${donor._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ recurringPlan: "weekly", recurringAmount: 1000 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should validate recurringAmount for monthly/yearly", async () => {
      const { donor, token } = await createDonorUser("amount@test.com");

      const res = await request(app)
        .put(`/api/donors/subscription/${donor._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ recurringPlan: "yearly", recurringAmount: 0 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should block non-owner donor", async () => {
      const owner = await createDonorUser("subowner@test.com");
      const other = await createDonorUser("subother@test.com");

      const res = await request(app)
        .put(`/api/donors/subscription/${owner.donor._id}`)
        .set("Authorization", `Bearer ${other.token}`)
        .send({ recurringPlan: "monthly", recurringAmount: 1000 });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/donors/subscription/:id/toggle", () => {
    test("should toggle subscription for owner donor", async () => {
      const { donor, token } = await createDonorUser("toggle-ok@test.com");

      await request(app)
        .put(`/api/donors/subscription/${donor._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ recurringPlan: "monthly", recurringAmount: 1200 });

      const res = await request(app)
        .patch(`/api/donors/subscription/${donor._id}/toggle`)
        .set("Authorization", `Bearer ${token}`)
        .send({ enabled: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.donor.isSubscriptionEnabled).toBe(false);
    });

    test("should validate enabled boolean", async () => {
      const { donor, token } = await createDonorUser("toggle@test.com");

      const res = await request(app)
        .patch(`/api/donors/subscription/${donor._id}/toggle`)
        .set("Authorization", `Bearer ${token}`)
        .send({ enabled: "true" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should reject enable when recurring plan is none", async () => {
      const { donor, token } = await createDonorUser("toggle-none@test.com");

      const res = await request(app)
        .patch(`/api/donors/subscription/${donor._id}/toggle`)
        .set("Authorization", `Bearer ${token}`)
        .send({ enabled: true });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Admin routes", () => {
    test("GET /api/donors should return all donors for admin", async () => {
      await createDonorUser("list-1@test.com");
      await createDonorUser("list-2@test.com");
      const { token } = await createAdminUser("admin-list@test.com");

      const res = await request(app).get("/api/donors").set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
    });

    test("GET /api/donors should reject non-admin user", async () => {
      const { token } = await createDonorUser("notadmin@test.com");

      const res = await request(app).get("/api/donors").set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test("GET /api/donors/admin/:id should return donor for admin", async () => {
      const { donor } = await createDonorUser("admin-get@test.com");
      const { token } = await createAdminUser("admin-get-user@test.com");

      const res = await request(app)
        .get(`/api/donors/admin/${donor._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("PUT /api/donors/admin/:id should update donor for admin", async () => {
      const { donor } = await createDonorUser("admin-update@test.com");
      const { token } = await createAdminUser("admin-update-user@test.com");

      const res = await request(app)
        .put(`/api/donors/admin/${donor._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Admin Updated", status: "Inactive" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.donor.fullName).toBe("Admin Updated");
    });

    test("DELETE /api/donors/:id should delete donor for admin", async () => {
      const { donor } = await createDonorUser("admin-delete@test.com");
      const { token } = await createAdminUser("admin-delete-user@test.com");

      const res = await request(app)
        .delete(`/api/donors/${donor._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("GET /api/donors should return 401 without token", async () => {
      const res = await request(app).get("/api/donors");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
