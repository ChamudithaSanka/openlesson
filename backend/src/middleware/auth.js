import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Student from "../models/studentRegModel.js";
import Donor from "../models/donor.model.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    
    // Check if user account is still active and exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // For students, check if student profile is also active
    if (decoded.userType === "student") {
      const student = await Student.findOne({ userId: decoded.id });
      if (!student || student.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Student account is inactive. Access denied.",
        });
      }
    }

    // For donors, check if donor profile is also active
    if (decoded.userType === "donor") {
      const donor = await Donor.findOne({ userId: decoded.id });
      if (!donor || donor.status !== "Active") {
        return res.status(403).json({
          success: false,
          message: "Donor account is inactive. Access denied.",
        });
      }
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.userType;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role ${userRole} is not authorized to access this route`,
      });
    }
    next();
  };
};
