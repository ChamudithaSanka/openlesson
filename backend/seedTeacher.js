import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Teacher from "./src/models/teacherModel.js";
import connectDB from "./src/config/db.js";

connectDB();

const seedTeacher = async () => {
  try {
    const teacher = new Teacher({
      fullName: "John Doe",
      email: "johndoe@example.com",
      qualification: "MSc Math",
      gradesTheyTeach: [], // for now empty
      subjectsTheyTeach: [], // for now empty
      status: "Approved"
    });

    await teacher.save();
    console.log("Dummy teacher created:", teacher._id);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedTeacher();