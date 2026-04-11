import { jest } from "@jest/globals";
import {
  getDonorProfile,
  updateDonorProfile,
  setDonorSubscription,
  toggleDonorSubscription,
  deleteDonor,
} from "../../../controllers/donor.controller.js";
import Donor from "../../../models/donor.model.js";
import User from "../../../models/user.model.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Chamuditha - Donor Controller Unit Tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("getDonorProfile should return 403 when non-owner donor tries to view profile", async () => {
    const req = { params: { id: "donor-1" }, user: { id: "user-2", userType: "donor" } };
    const res = mockRes();

    jest.spyOn(Donor, "findById").mockReturnValue({
      populate: jest.fn().mockResolvedValue({ userId: "user-1" }),
    });

    await getDonorProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not authorized to view this profile",
    });
  });

  test("updateDonorProfile should return 400 for duplicate email", async () => {
    const req = {
      params: { id: "donor-1" },
      user: { id: "user-1", userType: "donor" },
      body: { email: "new@mail.com" },
    };
    const res = mockRes();

    jest.spyOn(Donor, "findById").mockResolvedValue({ userId: "user-1" });
    jest.spyOn(User, "findOne").mockResolvedValue({ _id: "another-user" });

    await updateDonorProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Email already registered" });
  });

  test("setDonorSubscription should return 400 for invalid recurring plan", async () => {
    const req = {
      params: { id: "donor-1" },
      user: { id: "user-1", userType: "donor" },
      body: { recurringPlan: "weekly", recurringAmount: 1000 },
    };
    const res = mockRes();

    await setDonorSubscription(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "recurringPlan must be one of: none, monthly, yearly",
    });
  });

  test("toggleDonorSubscription should return 400 when enabled is not boolean", async () => {
    const req = {
      params: { id: "donor-1" },
      user: { id: "user-1", userType: "donor" },
      body: { enabled: "true" },
    };
    const res = mockRes();

    await toggleDonorSubscription(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "enabled must be boolean" });
  });

  test("deleteDonor should return 404 when donor not found", async () => {
    const req = { params: { id: "missing-id" } };
    const res = mockRes();

    jest.spyOn(Donor, "findByIdAndDelete").mockResolvedValue(null);

    await deleteDonor(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Donor not found" });
  });
});
