import { jest } from "@jest/globals";
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../../controllers/announcement.controller.js";
import Announcement from "../../../models/announcement.model.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Adeepa - Announcement Controller Unit Tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("getAllAnnouncements should return all announcements with populated data", async () => {
    const req = {};
    const res = mockRes();
    const mockAnnouncements = [{ _id: "ann-1", title: "Test 1", gradeId: { gradeName: "Grade 1" } }];

    jest.spyOn(Announcement, "find").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAnnouncements),
      }),
    });

    await getAllAnnouncements(req, res);

    expect(Announcement.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockAnnouncements });
  });

  test("getAllAnnouncements should handle database error", async () => {
    const req = {};
    const res = mockRes();

    jest.spyOn(Announcement, "find").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("DB error")),
      }),
    });

    await getAllAnnouncements(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "DB error" });
  });

  test("getAnnouncementById should return announcement when found", async () => {
    const req = { params: { id: "ann-1" } };
    const res = mockRes();
    const mockAnnouncement = { _id: "ann-1", title: "Test Announcement" };

    jest.spyOn(Announcement, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockAnnouncement),
      }),
    });

    await getAnnouncementById(req, res);

    expect(Announcement.findById).toHaveBeenCalledWith("ann-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockAnnouncement });
  });

  test("getAnnouncementById should return 404 when announcement not found", async () => {
    const req = { params: { id: "missing-id" } };
    const res = mockRes();

    jest.spyOn(Announcement, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      }),
    });

    await getAnnouncementById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Announcement not found" });
  });

  test("createAnnouncement should create announcement for valid data", async () => {
    const req = { body: { title: "New Announcement", description: "Test", gradeId: "grade-1", subjectId: "subject-1" } };
    const res = mockRes();
    const mockCreated = { _id: "ann-new", ...req.body };

    jest.spyOn(Announcement, "create").mockResolvedValue(mockCreated);
    jest.spyOn(Announcement, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCreated),
      }),
    });

    await createAnnouncement(req, res);

    expect(Announcement.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockCreated });
  });

  test("createAnnouncement should return 400 on validation error", async () => {
    const req = { body: { title: "" } };
    const res = mockRes();

    jest.spyOn(Announcement, "create").mockRejectedValue(new Error("Validation failed"));

    await createAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Validation failed" });
  });

  test("updateAnnouncement should update announcement when found", async () => {
    const req = { params: { id: "ann-1" }, body: { title: "Updated" } };
    const res = mockRes();
    const mockUpdated = { _id: "ann-1", title: "Updated" };

    jest.spyOn(Announcement, "findByIdAndUpdate").mockResolvedValue(mockUpdated);
    jest.spyOn(Announcement, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUpdated),
      }),
    });

    await updateAnnouncement(req, res);

    expect(Announcement.findByIdAndUpdate).toHaveBeenCalledWith("ann-1", req.body, expect.objectContaining({ runValidators: true }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUpdated });
  });

  test("updateAnnouncement should return 404 when not found", async () => {
    const req = { params: { id: "missing-id" }, body: { title: "Updated" } };
    const res = mockRes();

    jest.spyOn(Announcement, "findByIdAndUpdate").mockResolvedValue(null);
    jest.spyOn(Announcement, "findById").mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      }),
    });

    await updateAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Announcement not found" });
  });

  test("deleteAnnouncement should delete announcement when found", async () => {
    const req = { params: { id: "ann-1" } };
    const res = mockRes();
    const mockDeleted = { _id: "ann-1", title: "Test" };

    jest.spyOn(Announcement, "findByIdAndDelete").mockResolvedValue(mockDeleted);

    await deleteAnnouncement(req, res);

    expect(Announcement.findByIdAndDelete).toHaveBeenCalledWith("ann-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Announcement deleted" });
  });

  test("deleteAnnouncement should return 404 when not found", async () => {
    const req = { params: { id: "missing-id" } };
    const res = mockRes();

    jest.spyOn(Announcement, "findByIdAndDelete").mockResolvedValue(null);

    await deleteAnnouncement(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Announcement not found" });
  });
});
