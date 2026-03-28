import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/user.model.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment");
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email, userType: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    await User.create({
      email,
      password,
      userType: "admin",
      status: "active",
    });

    console.log("Admin seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
