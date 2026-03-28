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

    // Prevent updating userId through this endpoint
    delete updates.userId;

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
