import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../../../app.js";
import User from "../../../models/user.model.js";
import Teacher from "../../../models/teacher.model.js";
import Grade from "../../../models/grade.model.js";
import Subject from "../../../models/subject.model.js";
import Quiz from "../../../models/quiz.model.js";

let mongoServer;

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), email: user.email, userType: user.userType }, process.env.JWT_SECRET);

describe("Chamuditha - Quiz Routes Integration Tests", () => {
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

  test("GET /api/quizzes should return 200 for public access", async () => {
    const res = await request(app).get("/api/quizzes");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/quizzes should return 401 without token", async () => {
    const res = await request(app).post("/api/quizzes").send({ title: "Quiz" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/quizzes should return 400 for missing required fields", async () => {
    const teacherUser = await User.create({ email: "teacher1@test.com", password: "pass123", userType: "teacher", status: "active" });
    const token = createToken(teacherUser);

    const res = await request(app)
      .post("/api/quizzes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Only title" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST/PUT/DELETE /api/quizzes should complete CRUD flow", async () => {
    const teacherUser = await User.create({ email: "teacher2@test.com", password: "pass123", userType: "teacher", status: "active" });
    const teacher = await Teacher.create({ userId: teacherUser._id, fullName: "Teacher Two" });
    const grade = await Grade.create({ gradeName: "Grade 10" });
    const subject = await Subject.create({ subjectName: "Math" });
    const token = createToken(teacherUser);

    const createRes = await request(app)
      .post("/api/quizzes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Quiz A",
        description: "Basics",
        duration: 30,
        subjectId: subject._id,
        gradeId: grade._id,
        createdBy: teacher._id,
        questions: [
          {
            questionText: "2+2?",
            questionType: "single",
            options: ["3", "4", "5", "6"],
            correctAnswers: [1],
            points: 2,
          },
        ],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);

    const quizId = createRes.body.quiz._id;

    const updateRes = await request(app)
      .put(`/api/quizzes/${quizId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Quiz A - Updated",
        questions: [
          {
            questionText: "3+3?",
            questionType: "single",
            options: ["5", "6", "7", "8"],
            correctAnswers: [1],
            points: 5,
          },
        ],
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);

    const deleteRes = await request(app)
      .delete(`/api/quizzes/${quizId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const gone = await Quiz.findById(quizId);
    expect(gone).toBeNull();
  });

  test("GET /api/quizzes/:id should return 500 for invalid id format", async () => {
    const res = await request(app).get("/api/quizzes/not-a-valid-id");
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
