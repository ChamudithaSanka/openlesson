import Donor from "../models/donor.model.js";
import Donation from "../models/donation.model.js";
import User from "../models/user.model.js";

const getOwnerUserId = (donor) => {
  if (!donor || !donor.userId) return "";

  if (typeof donor.userId === "object") {
    return String(donor.userId._id || donor.userId.id || donor.userId);
  }

  return String(donor.userId);
};

// @desc    Get donor profile
// @route   GET /api/donors/profile/:id
// @access  Private
export const getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id).populate("userId", "email");
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && getOwnerUserId(donor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to view this profile" });
    }

    res.json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donors/profile/:id
// @access  Private (donor)
export const updateDonorProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    const nextEmail = typeof updates.email === "string" ? updates.email.trim().toLowerCase() : undefined;

    const existingDonor = await Donor.findById(req.params.id);
    if (!existingDonor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && getOwnerUserId(existingDonor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this profile" });
    }

    // Prevent updating userId through this endpoint
    delete updates.userId;
    delete updates.recurringPlan;
    delete updates.recurringAmount;
    delete updates.isSubscriptionEnabled;
    delete updates.email;

    if (nextEmail !== undefined) {
      if (!nextEmail) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }

      const duplicate = await User.findOne({
        email: nextEmail,
        _id: { $ne: existingDonor.userId },
      });

      if (duplicate) {
        return res.status(400).json({ success: false, message: "Email already registered" });
      }

      await User.findByIdAndUpdate(existingDonor.userId, { email: nextEmail });
    }

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("userId", "email");

    res.json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private (admin)
export const getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find().populate("userId", "email");
    res.json({ success: true, count: donors.length, donors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single donor for admin
// @route   GET /api/donors/admin/:id
// @access  Private (admin)
export const getDonorForAdmin = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id).populate("userId", "email");
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }
    res.json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update donor for admin
// @route   PUT /api/donors/admin/:id
// @access  Private (admin)
export const updateDonorForAdmin = async (req, res) => {
  try {
    const { fullName, phone, address, city, country, status } = req.body;
    
    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, address, city, country, status },
      { new: true, runValidators: true }
    ).populate("userId", "email");

    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    res.json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete donor
// @route   DELETE /api/donors/:id
// @access  Private (admin)
export const deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }
    res.json({ success: true, message: "Donor deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set donor subscription plan
// @route   PUT /api/donors/subscription/:id
// @access  Private (donor/admin)
export const setDonorSubscription = async (req, res) => {
  try {
    const { recurringPlan, recurringAmount } = req.body;

    if (!["none", "monthly", "yearly"].includes(recurringPlan)) {
      return res.status(400).json({
        success: false,
        message: "recurringPlan must be one of: none, monthly, yearly",
      });
    }

    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && getOwnerUserId(donor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this subscription" });
    }

    if (recurringPlan !== "none" && (!recurringAmount || Number(recurringAmount) <= 0)) {
      return res.status(400).json({
        success: false,
        message: "recurringAmount must be greater than 0 for monthly/yearly plans",
      });
    }

    donor.recurringPlan = recurringPlan;
    donor.recurringAmount = recurringPlan === "none" ? 0 : Number(recurringAmount);
    donor.isSubscriptionEnabled = recurringPlan !== "none";

    await donor.save();

    res.json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enable/disable donor subscription
// @route   PATCH /api/donors/subscription/:id/toggle
// @access  Private (donor/admin)
export const toggleDonorSubscription = async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({ success: false, message: "enabled must be boolean" });
    }

    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && getOwnerUserId(donor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to update this subscription" });
    }

    if (enabled && donor.recurringPlan === "none") {
      return res.status(400).json({
        success: false,
        message: "Set recurring plan first before enabling subscription",
      });
    }

    donor.isSubscriptionEnabled = enabled;
    await donor.save();

    res.json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get donor payment methods
// @route   GET /api/donors/payment-methods/:id
// @access  Private (donor/admin)
export const getDonorPaymentMethods = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && getOwnerUserId(donor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to view payment methods" });
    }

    res.json({ success: true, paymentMethods: donor.paymentMethods || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add donor payment method
// @route   POST /api/donors/payment-methods/:id
// @access  Private (donor/admin)
export const addDonorPaymentMethod = async (req, res) => {
  try {
    const { label, methodType, provider, brand, last4, expMonth, expYear } = req.body;

    if (!last4 || !/^\d{4}$/.test(String(last4))) {
      return res.status(400).json({ success: false, message: "last4 must be 4 digits" });
    }

    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && getOwnerUserId(donor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to add payment method" });
    }

    const newMethod = {
      label: label || "",
      methodType: methodType || "card",
      provider: provider || "",
      brand: brand || "",
      last4: String(last4),
      expMonth: expMonth ? Number(expMonth) : undefined,
      expYear: expYear ? Number(expYear) : undefined,
      status: "active",
      isDefault: donor.paymentMethods.length === 0,
    };

    donor.paymentMethods.push(newMethod);
    await donor.save();

    res.status(201).json({
      success: true,
      paymentMethods: donor.paymentMethods,
      message: "Payment method added",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update donor payment method
// @route   PUT /api/donors/payment-methods/:id/:methodId
// @access  Private (donor/admin)
export const updateDonorPaymentMethod = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && getOwnerUserId(donor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to update payment method" });
    }

    const method = donor.paymentMethods.id(req.params.methodId);
    if (!method) {
      return res.status(404).json({ success: false, message: "Payment method not found" });
    }

    const allowedFields = ["label", "provider", "brand", "expMonth", "expYear", "status"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        method[field] = req.body[field];
      }
    });

    await donor.save();

    res.json({ success: true, paymentMethods: donor.paymentMethods, message: "Payment method updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set default donor payment method
// @route   PATCH /api/donors/payment-methods/:id/:methodId/default
// @access  Private (donor/admin)
export const setDefaultDonorPaymentMethod = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && getOwnerUserId(donor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to change default payment method" });
    }

    const method = donor.paymentMethods.id(req.params.methodId);
    if (!method) {
      return res.status(404).json({ success: false, message: "Payment method not found" });
    }

    donor.paymentMethods.forEach((item) => {
      item.isDefault = String(item._id) === String(req.params.methodId);
    });

    await donor.save();

    res.json({ success: true, paymentMethods: donor.paymentMethods, message: "Default payment method updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete donor payment method
// @route   DELETE /api/donors/payment-methods/:id/:methodId
// @access  Private (donor/admin)
export const deleteDonorPaymentMethod = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && getOwnerUserId(donor) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to delete payment method" });
    }

    const method = donor.paymentMethods.id(req.params.methodId);
    if (!method) {
      return res.status(404).json({ success: false, message: "Payment method not found" });
    }

    const hasActiveRecurring = donor.isSubscriptionEnabled && donor.recurringPlan !== "none";
    if (hasActiveRecurring && donor.paymentMethods.length <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the last payment method while recurring subscription is active",
      });
    }

    const wasDefault = method.isDefault;
    method.deleteOne();

    if (wasDefault && donor.paymentMethods.length > 0) {
      donor.paymentMethods[0].isDefault = true;
    }

    await donor.save();

    res.json({ success: true, paymentMethods: donor.paymentMethods, message: "Payment method deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
