import { jest } from "@jest/globals";
import {
  createDonation,
  getDonationById,
  deleteDonation,
} from "../../../controllers/donation.controller.js";
import Donation from "../../../models/donation.model.js";
import Donor from "../../../models/donor.model.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Chamuditha - Donation Controller Unit Tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("createDonation should create donation for valid donor", async () => {
    const req = {
      body: { amount: 1000, paymentMethod: "Card", message: "Support" },
      user: { id: "user-1" },
    };
    const res = mockRes();

    jest.spyOn(Donor, "findOne").mockResolvedValue({ _id: "donor-1" });
    jest.spyOn(Donation, "create").mockResolvedValue({ _id: "donation-1" });

    await createDonation(req, res);

    expect(Donor.findOne).toHaveBeenCalledWith({ userId: "user-1" });
    expect(Donation.create).toHaveBeenCalledWith(
      expect.objectContaining({ donorId: "donor-1", amount: 1000, paymentStatus: "Pending" })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, donation: { _id: "donation-1" } });
  });

  test("createDonation should return 404 when donor profile not found", async () => {
    const req = { body: { amount: 1000, paymentMethod: "Card" }, user: { id: "user-1" } };
    const res = mockRes();

    jest.spyOn(Donor, "findOne").mockResolvedValue(null);

    await createDonation(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Donor profile not found" });
  });

  test("getDonationById should return 404 when donation not found", async () => {
    const req = { params: { id: "missing-id" } };
    const res = mockRes();

    jest.spyOn(Donation, "findById").mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await getDonationById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Donation not found" });
  });

  test("deleteDonation should block donor deleting another donor donation", async () => {
    const req = { params: { id: "donation-1" }, user: { id: "user-1", userType: "donor" } };
    const res = mockRes();
    const deleteOne = jest.fn();

    jest.spyOn(Donation, "findById").mockResolvedValue({
      _id: "donation-1",
      donorId: "owner-donor-id",
      deleteOne,
    });
    jest.spyOn(Donor, "findOne").mockResolvedValue({ _id: "another-donor-id" });

    await deleteDonation(req, res);

    expect(deleteOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not authorized to delete this donation.",
    });
  });

  test("createDonation should return 500 on internal error", async () => {
    const req = { body: { amount: 500, paymentMethod: "Card" }, user: { id: "user-1" } };
    const res = mockRes();

    jest.spyOn(Donor, "findOne").mockRejectedValue(new Error("DB failed"));

    await createDonation(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "DB failed" });
  });
});
