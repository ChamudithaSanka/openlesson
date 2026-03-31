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
    const { fullName, email, password, userType, phone, gradeId, schoolName, district, qualification, companyName } = req.body;
    const cvUrl = req.file ? `/uploads/cv/${req.file.filename}` : null;

    if (userType === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot self-register",
      });
    }

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
          schoolName,
          district,
          status: "active",
        });
      } else if (userType === "teacher") {
        if (!cvUrl) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: "CV document is required for teacher registration",
          });
        }

        userProfile = await Teacher.create({
          userId: user._id,
          fullName,
          phone,
          qualification,
          cvUrl,
          status: "Pending",
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
      message:
        userType === "teacher"
          ? "Teacher registered successfully. Account is pending admin approval."
          : `${userType.charAt(0).toUpperCase() + userType.slice(1)} registered successfully`,
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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
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
    if (user.userType === "student") {
      userProfile = await Student.findOne({ userId: user._id }).select("-password");
      if (!userProfile) {
        return res.status(404).json({ success: false, message: "Student profile not found" });
      }
      
      // Check if student is active
      if (userProfile.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Student account is inactive. Please contact administrator.",
        });
      }
    } else if (user.userType === "teacher") {
      userProfile = await Teacher.findOne({ userId: user._id }).select("-password");
      if (!userProfile) {
        return res.status(404).json({ success: false, message: "Teacher profile not found" });
      }

      if (userProfile.status !== "Approved") {
        return res.status(403).json({
          success: false,
          message: `Teacher account is ${userProfile.status}. Please wait for admin approval.`,
        });
      }
    } else if (user.userType === "donor") {
      userProfile = await Donor.findOne({ userId: user._id }).select("-password");
      if (!userProfile) {
        return res.status(404).json({ success: false, message: "Donor profile not found" });
      }

      // Check if donor is active
      if (userProfile.status !== "Active") {
        return res.status(403).json({
          success: false,
          message: "Donor account is inactive. Please contact administrator.",
        });
      }
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
