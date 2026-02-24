import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Grade from './src/models/gradeModel.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const seedGrades = async () => {
  try {
    const grades = [
      { gradeName: 'Grade 1', description: 'Primary school' },
      { gradeName: 'Grade 5', description: 'Primary school' },
      { gradeName: 'Grade 10', description: 'Secondary school' },
      { gradeName: 'Grade 12', description: 'Advanced level' },
      { gradeName: 'Grade 13', description: 'Advanced level' }
    ];

    await Grade.insertMany(grades);
    console.log('Grades added successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding grades:', err);
    process.exit(1);
  }
};

connectDB().then(seedGrades);