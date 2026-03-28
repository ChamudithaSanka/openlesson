import User from "../models/user.model.js";
import Student from "../models/studentRegModel.js";
import Teacher from "../models/teacher.model.js";
import Donor from "../models/donor.model.js";
import { generateToken } from "../utils/jwt.js";

// @desc    Register user (student, teacher, or donor)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { fullName, email, password, userType, phone, gradeId, qualification, companyName } = req.body;

    // Validate userType
    if (!["student", "teacher", "donor"].includes(userType)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user type. Must be student, teacher, or donor" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    // Create user account
    const user = await User.create({
      email,
      password,
      userType,
      status: "active",
    });

    // Create user-specific profile
    let userProfile;
    try {
      if (userType === "student") {
        userProfile = await Student.create({
          userId: user._id,
          fullName,
          phone,
          gradeId,
          status: "active",
        });
      } else if (userType === "teacher") {
        userProfile = await Teacher.create({
          userId: user._id,
          fullName,
          phone,
          qualification,
          status: "Approved",
        });
      } else if (userType === "donor") {
        userProfile = await Donor.create({
          userId: user._id,
          fullName,
          phone,
          companyName,
          status: "Active",
        });
      }
    } catch (profileError) {
      // If profile creation fails, delete the user
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      userType: user.userType,
    });

    res.status(201).json({
      success: true,
      message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully`,
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        fullName,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validate input
    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and userType are required",
      });
    }

    // Validate userType
    if (!["student", "teacher", "donor"].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check userType matches
    if (user.userType !== userType) {
      return res.status(401).json({
        success: false,
        message: `This email is not registered as a ${userType}`,
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      userType: user.userType,
    });

    // Fetch user profile
    let userProfile;
    if (userType === "student") {
      userProfile = await Student.findOne({ userId: user._id }).select("-password");
    } else if (userType === "teacher") {
      userProfile = await Teacher.findOne({ userId: user._id }).select("-password");
    } else if (userType === "donor") {
      userProfile = await Donor.findOne({ userId: user._id }).select("-password");
    }

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        profile: userProfile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch user profile
    let userProfile;
    if (user.userType === "student") {
      userProfile = await Student.findOne({ userId: user._id }).select("-password");
    } else if (user.userType === "teacher") {
      userProfile = await Teacher.findOne({ userId: user._id }).select("-password");
    } else if (user.userType === "donor") {
      userProfile = await Donor.findOne({ userId: user._id }).select("-password");
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        profile: userProfile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
