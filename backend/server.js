import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start Express server
app.listen(PORT, () => {
  console.log(`OpenLesson backend running on port ${PORT}`);
});
