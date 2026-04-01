import Donation from "../models/donation.model.js";
import Donor from "../models/donor.model.js";

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Public
export const createDonation = async (req, res) => {
  try {
    const { amount, paymentMethod, message } = req.body;

    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor profile not found" });
    }

    const donation = await Donation.create({
      donorId: donor._id,
      amount,
      paymentMethod,
      message,
      paymentStatus: "Pending",
    });

    res.status(201).json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get donation history for a specific donor
// @route   GET /api/donations/my/:donorId
// @access  Public
export const getMyDonations = async (req, res) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor profile not found" });
    }

    const donations = await Donation.find({ donorId: donor._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: donations.length, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private (admin)
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate("donorId", "fullName email").sort({ createdAt: -1 });
    res.json({ success: true, count: donations.length, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get donations by donor
// @route   GET /api/donations/donor/:donorId
// @access  Private (admin)
export const getDonationsByDonor = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.params.donorId })
      .populate("donorId", "fullName email")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: donations.length, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private (admin)
export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate("donorId", "fullName email");
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }
    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update donation payment status
// @route   PUT /api/donations/:id
// @access  Private (admin)
export const updateDonationStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private (admin)
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }
    res.json({ success: true, message: "Donation deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
