/**
 * Database Configuration
 * Handles MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * @description Establishes connection to MongoDB using connection string from environment variables
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using URI from .env file
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    // Log successful connection with host information
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log error message if connection fails
    console.error(`Error: ${error.message}`);
    
    // Exit process with failure code (1)
    process.exit(1);
  }
};

// Export the connectDB function for use in server.js
module.exports = connectDB;
