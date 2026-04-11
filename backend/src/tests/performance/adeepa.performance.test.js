import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../app.js";
import User from "../../models/user.model.js";
import Grade from "../../models/grade.model.js";
import Subject from "../../models/subject.model.js";
import Announcement from "../../models/announcement.model.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, userType: user.userType }, process.env.JWT_SECRET);

const measureTime = async (fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { time: end - start, result };
};

describe("Adeepa - Performance Tests", () => {
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

  describe("Grade Operations Performance", () => {
    test("GET /api/grades - should complete in < 200ms", async () => {
      await Grade.create({ gradeName: "Grade 1", description: "First Grade" });

      const { time } = await measureTime(async () => {
        return await request(app).get("/api/grades");
      });

      console.log(`GET /api/grades: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200);
    });

    test("POST /api/grades - should complete in < 250ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await request(app)
          .post("/api/grades")
          .set("Authorization", `Bearer ${token}`)
          .send({ gradeName: "New Grade", description: "Test" });
      });

      console.log(`POST /api/grades: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(250);
    });

    test("GET /api/grades/:id - should complete in < 200ms", async () => {
      const grade = await Grade.create({ gradeName: "Grade 2", description: "Second Grade" });

      const { time } = await measureTime(async () => {
        return await request(app).get(`/api/grades/${grade._id}`);
      });

      console.log(`GET /api/grades/:id: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200);
    });

    test("PUT /api/grades/:id - should complete in < 250ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const grade = await Grade.create({ gradeName: "Grade 3", description: "Third Grade" });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await request(app)
          .put(`/api/grades/${grade._id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ gradeName: "Updated Grade" });
      });

      console.log(`PUT /api/grades/:id: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(250);
    });

    test("DELETE /api/grades/:id - should complete in < 250ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const grade = await Grade.create({ gradeName: "To Delete", description: "Test" });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await request(app)
          .delete(`/api/grades/${grade._id}`)
          .set("Authorization", `Bearer ${token}`);
      });

      console.log(`DELETE /api/grades/:id: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(250);
    });
  });

  describe("Subject Operations Performance", () => {
    test("GET /api/subjects - should complete in < 200ms", async () => {
      await Subject.create({ subjectName: "Math", description: "Mathematics" });

      const { time } = await measureTime(async () => {
        return await request(app).get("/api/subjects");
      });

      console.log(`GET /api/subjects: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200);
    });

    test("POST /api/subjects - should complete in < 250ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await request(app)
          .post("/api/subjects")
          .set("Authorization", `Bearer ${token}`)
          .send({ subjectName: "English", description: "English Language" });
      });

      console.log(`POST /api/subjects: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(250);
    });

    test("GET /api/subjects/:id - should complete in < 200ms", async () => {
      const subject = await Subject.create({ subjectName: "Science", description: "Science" });

      const { time } = await measureTime(async () => {
        return await request(app).get(`/api/subjects/${subject._id}`);
      });

      console.log(`GET /api/subjects/:id: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200);
    });

    test("PUT /api/subjects/:id - should complete in < 250ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const subject = await Subject.create({ subjectName: "History", description: "World History" });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await request(app)
          .put(`/api/subjects/${subject._id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ subjectName: "Advanced History" });
      });

      console.log(`PUT /api/subjects/:id: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(250);
    });

    test("DELETE /api/subjects/:id - should complete in < 250ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const subject = await Subject.create({ subjectName: "To Delete", description: "Test" });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await request(app)
          .delete(`/api/subjects/${subject._id}`)
          .set("Authorization", `Bearer ${token}`);
      });

      console.log(`DELETE /api/subjects/:id: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(250);
    });
  });

  describe("Announcement Operations Performance", () => {
    test("GET /api/announcements - should complete in < 200ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const grade = await Grade.create({ gradeName: "Grade 1" });
      const subject = await Subject.create({ subjectName: "Math" });
      await Announcement.create({
        title: "Test",
        message: "Test announcement",
        postedBy: admin._id,
        targetRole: "student",
        gradeId: grade._id,
        subjectId: subject._id,
      });

      const { time } = await measureTime(async () => {
        return await request(app).get("/api/announcements");
      });

      console.log(`GET /api/announcements: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200);
    });

    test("POST /api/announcements - should complete in < 300ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const grade = await Grade.create({ gradeName: "Grade 1" });
      const subject = await Subject.create({ subjectName: "Math" });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await request(app)
          .post("/api/announcements")
          .set("Authorization", `Bearer ${token}`)
          .send({
            title: "New Announcement",
            message: "Announcement message",
            postedBy: admin._id.toString(),
            targetRole: "student",
            gradeId: grade._id.toString(),
            subjectId: subject._id.toString(),
          });
      });

      console.log(`POST /api/announcements: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(300);
    });

    test("GET /api/announcements/:id - should complete in < 200ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const grade = await Grade.create({ gradeName: "Grade 1" });
      const subject = await Subject.create({ subjectName: "Math" });
      const announcement = await Announcement.create({
        title: "Test",
        message: "Test announcement",
        postedBy: admin._id,
        targetRole: "student",
        gradeId: grade._id,
        subjectId: subject._id,
      });

      const { time } = await measureTime(async () => {
        return await request(app).get(`/api/announcements/${announcement._id}`);
      });

      console.log(`GET /api/announcements/:id: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200);
    });

    test("PUT /api/announcements/:id - should complete in < 300ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const grade = await Grade.create({ gradeName: "Grade 1" });
      const subject = await Subject.create({ subjectName: "Math" });
      const announcement = await Announcement.create({
        title: "Test",
        message: "Test announcement",
        postedBy: admin._id,
        targetRole: "student",
        gradeId: grade._id,
        subjectId: subject._id,
      });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await request(app)
          .put(`/api/announcements/${announcement._id}`)
          .set("Authorization", `Bearer ${token}`)
          .send({ title: "Updated" });
      });

      console.log(`PUT /api/announcements/:id: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(300);
    });

    test("DELETE /api/announcements/:id - should complete in < 300ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const grade = await Grade.create({ gradeName: "Grade 1" });
      const subject = await Subject.create({ subjectName: "Math" });
      const announcement = await Announcement.create({
        title: "Test",
        message: "Test announcement",
        postedBy: admin._id,
        targetRole: "student",
        gradeId: grade._id,
        subjectId: subject._id,
      });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await request(app)
          .delete(`/api/announcements/${announcement._id}`)
          .set("Authorization", `Bearer ${token}`);
      });

      console.log(`DELETE /api/announcements/:id: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(300);
    });
  });

  describe("Concurrent Operations Performance", () => {
    test("Concurrent Grade GETs (5 requests) - should complete in < 1000ms", async () => {
      const grades = await Promise.all([
        Grade.create({ gradeName: "Grade 1", description: "Test 1" }),
        Grade.create({ gradeName: "Grade 2", description: "Test 2" }),
        Grade.create({ gradeName: "Grade 3", description: "Test 3" }),
        Grade.create({ gradeName: "Grade 4", description: "Test 4" }),
        Grade.create({ gradeName: "Grade 5", description: "Test 5" }),
      ]);

      const { time } = await measureTime(async () => {
        return await Promise.all(
          grades.map((grade) => request(app).get(`/api/grades/${grade._id}`))
        );
      });

      console.log(`Concurrent Grade GETs (5 requests): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(1000);
    });

    test("Concurrent Subject GETs (5 requests) - should complete in < 1000ms", async () => {
      const subjects = await Promise.all([
        Subject.create({ subjectName: "Math", description: "Test 1" }),
        Subject.create({ subjectName: "English", description: "Test 2" }),
        Subject.create({ subjectName: "Science", description: "Test 3" }),
        Subject.create({ subjectName: "History", description: "Test 4" }),
        Subject.create({ subjectName: "Art", description: "Test 5" }),
      ]);

      const { time } = await measureTime(async () => {
        return await Promise.all(
          subjects.map((subject) => request(app).get(`/api/subjects/${subject._id}`))
        );
      });

      console.log(`Concurrent Subject GETs (5 requests): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(1000);
    });

    test("Concurrent Announcement GETs with populate - should complete in < 1200ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const grade = await Grade.create({ gradeName: "Grade 1" });
      const subject = await Subject.create({ subjectName: "Math" });

      const announcements = await Promise.all(
        Array.from({ length: 5 }).map((_, i) =>
          Announcement.create({
            title: `Announcement ${i + 1}`,
            message: `Message ${i + 1}`,
            postedBy: admin._id,
            targetRole: "student",
            gradeId: grade._id,
            subjectId: subject._id,
          })
        )
      );

      const { time } = await measureTime(async () => {
        return await Promise.all(
          announcements.map((ann) => request(app).get(`/api/announcements/${ann._id}`))
        );
      });

      console.log(`Concurrent Announcement GETs with populate (5 requests): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(1200);
    });
  });

  describe("Batch Operations Performance", () => {
    test("Bulk Grade Creation (5 documents) - should complete in < 1500ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await Promise.all(
          Array.from({ length: 5 }).map((_, i) =>
            request(app)
              .post("/api/grades")
              .set("Authorization", `Bearer ${token}`)
              .send({ gradeName: `Grade ${i + 1}`, description: `Test ${i + 1}` })
          )
        );
      });

      console.log(`Bulk Grade Creation (5 requests): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(1500);
    });

    test("Bulk Subject Creation (5 documents) - should complete in < 1500ms", async () => {
      const admin = await User.create({ email: "admin@test.com", password: "pass123", userType: "admin", status: "active" });
      const token = createToken(admin);

      const { time } = await measureTime(async () => {
        return await Promise.all(
          Array.from({ length: 5 }).map((_, i) =>
            request(app)
              .post("/api/subjects")
              .set("Authorization", `Bearer ${token}`)
              .send({ subjectName: `Subject ${i + 1}`, description: `Test ${i + 1}` })
          )
        );
      });

      console.log(`Bulk Subject Creation (5 requests): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(1500);
    });
  });
});
