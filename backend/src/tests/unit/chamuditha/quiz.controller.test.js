import { jest } from "@jest/globals";
import {
  createQuiz,
  getQuizById,
  deleteQuiz,
} from "../../../controllers/quiz.controller.js";
import Quiz from "../../../models/quiz.model.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Chamuditha - Quiz Controller Unit Tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("createQuiz should return 400 when required fields are missing", async () => {
    const req = { body: { title: "Quiz" } };
    const res = mockRes();

    await createQuiz(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing required fields: title, subjectId, gradeId, createdBy, questions",
    });
  });

  test("createQuiz should calculate total points and return 201", async () => {
    const req = {
      body: {
        title: "Quiz 1",
        description: "Basics",
        subjectId: "subject-1",
        gradeId: "grade-1",
        createdBy: "teacher-1",
        questions: [
          { questionText: "Q1", points: 2 },
          { questionText: "Q2", points: 3 },
        ],
      },
    };
    const res = mockRes();

    const populated = { _id: "quiz-1", totalPoints: 5 };
    const quizDoc = {
      populate: jest.fn().mockResolvedValue(populated),
    };

    jest.spyOn(Quiz, "create").mockResolvedValue(quizDoc);

    await createQuiz(req, res);

    expect(Quiz.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Quiz 1", totalPoints: 5 })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, quiz: populated });
  });

  test("getQuizById should return 404 when quiz not found", async () => {
    const req = { params: { id: "missing-id" } };
    const res = mockRes();

    const thirdPopulate = jest.fn().mockResolvedValue(null);
    const secondPopulate = jest.fn().mockReturnValue({ populate: thirdPopulate });
    const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

    jest.spyOn(Quiz, "findById").mockReturnValue({ populate: firstPopulate });

    await getQuizById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Quiz not found" });
  });

  test("deleteQuiz should return 404 when quiz does not exist", async () => {
    const req = { params: { id: "missing-id" } };
    const res = mockRes();

    jest.spyOn(Quiz, "findByIdAndDelete").mockResolvedValue(null);

    await deleteQuiz(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Quiz not found" });
  });

  test("createQuiz should return 500 when model throws error", async () => {
    const req = {
      body: {
        title: "Quiz 1",
        subjectId: "subject-1",
        gradeId: "grade-1",
        createdBy: "teacher-1",
        questions: [{ questionText: "Q1" }],
      },
    };
    const res = mockRes();

    jest.spyOn(Quiz, "create").mockRejectedValue(new Error("Insert failed"));

    await createQuiz(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Insert failed" });
  });
});
