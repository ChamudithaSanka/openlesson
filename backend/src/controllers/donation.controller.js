import Donation from "../models/donation.model.js";
import Donor from "../models/donor.model.js";

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (donor)
export const createDonation = async (req, res) => {
  try {
    const { amount, paymentMethod, message } = req.body;

    const donation = await Donation.create({
      donorId: req.user.id,
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

// @desc    Complete a donation (simulate Stripe confirmation)
// @route   PUT /api/donations/:id/complete
// @access  Private (donor)
export const completeDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    donation.paymentStatus = "Completed";
    await donation.save();

    // Update totalDonated on donor
    await Donor.findByIdAndUpdate(donation.donorId, {
      $inc: { totalDonated: donation.amount },
    });

    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged-in donor's donation history
// @route   GET /api/donations/my
// @access  Private (donor)
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id }).sort({ createdAt: -1 });
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
