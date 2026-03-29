import Donor from "../models/donor.model.js";
import Donation from "../models/donation.model.js";

// @desc    Get donor profile
// @route   GET /api/donors/profile/:id
// @access  Private
export const getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id).populate("userId", "email");
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && donor.userId.toString() !== req.user.id) {
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
    const updates = req.body;

    const existingDonor = await Donor.findById(req.params.id);
    if (!existingDonor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    if (req.user.userType !== "admin" && existingDonor.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this profile" });
    }

    // Prevent updating userId through this endpoint
    delete updates.userId;
    delete updates.recurringPlan;
    delete updates.recurringAmount;
    delete updates.isSubscriptionEnabled;

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

// @desc    Update donor status
// @route   PUT /api/donors/:id/status
// @access  Private (admin)
export const updateDonorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
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

    if (req.user.userType !== "admin" && donor.userId.toString() !== req.user.id) {
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

    if (req.user.userType !== "admin" && donor.userId.toString() !== req.user.id) {
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
