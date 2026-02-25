import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    
    // Set up event listeners after successful connection
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('Please check:');
    console.error('1. MongoDB URI is correct in .env file');
    console.error('2. Database user credentials are correct');
    console.error('3. IP address is whitelisted in MongoDB Atlas');
    console.error('4. Network connection is stable');
    process.exit(1);
  }
};

export default connectDB;
