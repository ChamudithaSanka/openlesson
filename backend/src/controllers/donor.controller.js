import Donor from "../models/donor.model.js";
import Donation from "../models/donation.model.js";
import { generateToken } from "../utils/jwt.js";

// @desc    Register a new donor
// @route   POST /api/donors/register
// @access  Public
export const registerDonor = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const existingDonor = await Donor.findOne({ email });
    if (existingDonor) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const donor = await Donor.create({ fullName, email, password, phone });

    const token = generateToken({ id: donor._id, email: donor.email, role: donor.role });

    res.status(201).json({ success: true, token, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login donor
// @route   POST /api/donors/login
// @access  Public
export const loginDonor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const donor = await Donor.findOne({ email });
    if (!donor || donor.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (donor.status === "Inactive") {
      return res.status(403).json({ success: false, message: "Account is inactive" });
    }

    const token = generateToken({ id: donor._id, email: donor.email, role: donor.role });

    res.json({ success: true, token, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get donor profile
// @route   GET /api/donors/profile
// @access  Private (donor)
export const getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findById(req.user.id).select("-password");
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }
    res.json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donors/profile
// @access  Private (donor)
export const updateDonorProfile = async (req, res) => {
  try {
    const { fullName, phone, password } = req.body;

    const donor = await Donor.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, password },
      { new: true, runValidators: true }
    ).select("-password");

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
    const donors = await Donor.find().select("-password");
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
    ).select("-password");

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
