import { jest } from "@jest/globals";
import {
  getDonorProfile,
  updateDonorProfile,
  getAllDonors,
  getDonorForAdmin,
  updateDonorForAdmin,
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

  describe("getDonorProfile", () => {
    test("should return donor profile for owner", async () => {
      const req = { params: { id: "donor-1" }, user: { id: "user-1", userType: "donor" } };
      const res = mockRes();
      const donor = { _id: "donor-1", userId: "user-1", fullName: "Owner Donor" };

      jest.spyOn(Donor, "findById").mockReturnValue({
        populate: jest.fn().mockResolvedValue(donor),
      });

      await getDonorProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, donor });
    });

    test("should return 403 when non-owner donor tries to view profile", async () => {
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

    test("should return 404 when donor not found", async () => {
      const req = { params: { id: "missing-id" }, user: { id: "admin-id", userType: "admin" } };
      const res = mockRes();

      jest.spyOn(Donor, "findById").mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await getDonorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Donor not found" });
    });

    test("should return 500 when query throws", async () => {
      const req = { params: { id: "donor-1" }, user: { id: "admin-id", userType: "admin" } };
      const res = mockRes();

      jest.spyOn(Donor, "findById").mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Query failed")),
      });

      await getDonorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Query failed" });
    });
  });

  describe("updateDonorProfile", () => {
    test("should update donor and normalize email for owner", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-1", userType: "donor" },
        body: { fullName: "Updated Donor", email: "  NEW@MAIL.COM " },
      };
      const res = mockRes();

      const updatedDonor = { _id: "donor-1", fullName: "Updated Donor", userId: "user-1" };

      jest.spyOn(Donor, "findById").mockResolvedValue({ _id: "donor-1", userId: "user-1" });
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      jest.spyOn(User, "findByIdAndUpdate").mockResolvedValue({});
      jest.spyOn(Donor, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedDonor),
      });

      await updateDonorProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith("user-1", { email: "new@mail.com" });
      expect(res.json).toHaveBeenCalledWith({ success: true, donor: updatedDonor });
    });

    test("should return 404 when donor does not exist", async () => {
      const req = {
        params: { id: "missing-id" },
        user: { id: "user-1", userType: "donor" },
        body: { fullName: "Any" },
      };
      const res = mockRes();

      jest.spyOn(Donor, "findById").mockResolvedValue(null);

      await updateDonorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Donor not found" });
    });

    test("should return 403 for non-owner donor", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-2", userType: "donor" },
        body: { fullName: "Any" },
      };
      const res = mockRes();

      jest.spyOn(Donor, "findById").mockResolvedValue({ _id: "donor-1", userId: "user-1" });

      await updateDonorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Not authorized to update this profile",
      });
    });

    test("should return 400 when email is duplicate", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-1", userType: "donor" },
        body: { email: "new@mail.com" },
      };
      const res = mockRes();

      jest.spyOn(Donor, "findById").mockResolvedValue({ _id: "donor-1", userId: "user-1" });
      jest.spyOn(User, "findOne").mockResolvedValue({ _id: "another-user" });

      await updateDonorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Email already registered" });
    });

    test("should return 400 when email is blank", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-1", userType: "donor" },
        body: { email: "   " },
      };
      const res = mockRes();

      jest.spyOn(Donor, "findById").mockResolvedValue({ _id: "donor-1", userId: "user-1" });

      await updateDonorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Email is required" });
    });

    test("should return 500 when update fails", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-1", userType: "donor" },
        body: { fullName: "Updated" },
      };
      const res = mockRes();

      jest.spyOn(Donor, "findById").mockResolvedValue({ _id: "donor-1", userId: "user-1" });
      jest.spyOn(Donor, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Update failed")),
      });

      await updateDonorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Update failed" });
    });
  });

  describe("getAllDonors", () => {
    test("should return all donors with count", async () => {
      const req = {};
      const res = mockRes();
      const donors = [{ _id: "d1" }, { _id: "d2" }];

      jest.spyOn(Donor, "find").mockReturnValue({
        populate: jest.fn().mockResolvedValue(donors),
      });

      await getAllDonors(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, count: 2, donors });
    });

    test("should return 500 when find fails", async () => {
      const req = {};
      const res = mockRes();

      jest.spyOn(Donor, "find").mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error("Find failed")),
      });

      await getAllDonors(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Find failed" });
    });
  });

  describe("getDonorForAdmin", () => {
    test("should return donor for admin", async () => {
      const req = { params: { id: "donor-1" } };
      const res = mockRes();
      const donor = { _id: "donor-1", fullName: "Admin View" };

      jest.spyOn(Donor, "findById").mockReturnValue({
        populate: jest.fn().mockResolvedValue(donor),
      });

      await getDonorForAdmin(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, donor });
    });

    test("should return 404 when donor does not exist", async () => {
      const req = { params: { id: "missing-id" } };
      const res = mockRes();

      jest.spyOn(Donor, "findById").mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await getDonorForAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Donor not found" });
    });
  });

  describe("updateDonorForAdmin", () => {
    test("should update donor for admin", async () => {
      const req = {
        params: { id: "donor-1" },
        body: { fullName: "Admin Updated", status: "Inactive" },
      };
      const res = mockRes();
      const donor = { _id: "donor-1", fullName: "Admin Updated", status: "Inactive" };

      jest.spyOn(Donor, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockResolvedValue(donor),
      });

      await updateDonorForAdmin(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, donor });
    });

    test("should return 404 when donor not found on admin update", async () => {
      const req = { params: { id: "missing-id" }, body: { fullName: "X" } };
      const res = mockRes();

      jest.spyOn(Donor, "findByIdAndUpdate").mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await updateDonorForAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Donor not found" });
    });
  });

  describe("setDonorSubscription", () => {
    test("should return 400 for invalid recurring plan", async () => {
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

    test("should return 400 when recurringAmount is invalid", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-1", userType: "donor" },
        body: { recurringPlan: "monthly", recurringAmount: 0 },
      };
      const res = mockRes();
      jest.spyOn(Donor, "findById").mockResolvedValue({ _id: "donor-1", userId: "user-1" });

      await setDonorSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "recurringAmount must be greater than 0 for monthly/yearly plans",
      });
    });

    test("should set monthly subscription for owner", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-1", userType: "donor" },
        body: { recurringPlan: "monthly", recurringAmount: 1500 },
      };
      const res = mockRes();
      const save = jest.fn().mockResolvedValue();
      const donorDoc = {
        _id: "donor-1",
        userId: "user-1",
        recurringPlan: "none",
        recurringAmount: 0,
        isSubscriptionEnabled: false,
        save,
      };

      jest.spyOn(Donor, "findById").mockResolvedValue(donorDoc);

      await setDonorSubscription(req, res);

      expect(save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, donor: donorDoc });
      expect(donorDoc.recurringPlan).toBe("monthly");
      expect(donorDoc.recurringAmount).toBe(1500);
      expect(donorDoc.isSubscriptionEnabled).toBe(true);
    });

    test("should set none plan and disable subscription", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "admin-1", userType: "admin" },
        body: { recurringPlan: "none", recurringAmount: 9999 },
      };
      const res = mockRes();
      const save = jest.fn().mockResolvedValue();
      const donorDoc = { _id: "donor-1", userId: "user-1", save };

      jest.spyOn(Donor, "findById").mockResolvedValue(donorDoc);

      await setDonorSubscription(req, res);

      expect(donorDoc.recurringPlan).toBe("none");
      expect(donorDoc.recurringAmount).toBe(0);
      expect(donorDoc.isSubscriptionEnabled).toBe(false);
      expect(res.json).toHaveBeenCalledWith({ success: true, donor: donorDoc });
    });

    test("should return 403 when non-owner donor tries to set subscription", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-2", userType: "donor" },
        body: { recurringPlan: "monthly", recurringAmount: 1000 },
      };
      const res = mockRes();
      jest.spyOn(Donor, "findById").mockResolvedValue({ _id: "donor-1", userId: "user-1" });

      await setDonorSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Not authorized to update this subscription",
      });
    });
  });

  describe("toggleDonorSubscription", () => {
    test("should return 400 when enabled is not boolean", async () => {
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

    test("should return 400 when enabling without recurring plan", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-1", userType: "donor" },
        body: { enabled: true },
      };
      const res = mockRes();
      const donorDoc = { _id: "donor-1", userId: "user-1", recurringPlan: "none" };

      jest.spyOn(Donor, "findById").mockResolvedValue(donorDoc);

      await toggleDonorSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Set recurring plan first before enabling subscription",
      });
    });

    test("should toggle subscription successfully", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-1", userType: "donor" },
        body: { enabled: false },
      };
      const res = mockRes();
      const save = jest.fn().mockResolvedValue();
      const donorDoc = { _id: "donor-1", userId: "user-1", recurringPlan: "monthly", isSubscriptionEnabled: true, save };

      jest.spyOn(Donor, "findById").mockResolvedValue(donorDoc);

      await toggleDonorSubscription(req, res);

      expect(save).toHaveBeenCalled();
      expect(donorDoc.isSubscriptionEnabled).toBe(false);
      expect(res.json).toHaveBeenCalledWith({ success: true, donor: donorDoc });
    });

    test("should return 403 when non-owner donor tries to toggle", async () => {
      const req = {
        params: { id: "donor-1" },
        user: { id: "user-2", userType: "donor" },
        body: { enabled: true },
      };
      const res = mockRes();
      jest.spyOn(Donor, "findById").mockResolvedValue({ _id: "donor-1", userId: "user-1", recurringPlan: "monthly" });

      await toggleDonorSubscription(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Not authorized to update this subscription",
      });
    });
  });

  describe("deleteDonor", () => {
    test("should delete donor successfully", async () => {
      const req = { params: { id: "donor-1" } };
      const res = mockRes();

      jest.spyOn(Donor, "findByIdAndDelete").mockResolvedValue({ _id: "donor-1" });

      await deleteDonor(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Donor deleted successfully",
      });
    });

    test("should return 404 when donor not found", async () => {
      const req = { params: { id: "missing-id" } };
      const res = mockRes();

      jest.spyOn(Donor, "findByIdAndDelete").mockResolvedValue(null);

      await deleteDonor(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Donor not found" });
    });

    test("should return 500 when delete fails", async () => {
      const req = { params: { id: "donor-1" } };
      const res = mockRes();

      jest.spyOn(Donor, "findByIdAndDelete").mockRejectedValue(new Error("Delete failed"));

      await deleteDonor(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Delete failed" });
    });
    });
});
