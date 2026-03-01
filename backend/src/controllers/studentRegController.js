import Student from '../models/studentRegModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const registerStudent = async (req, res) => {
  try {
    const { fullName, email, password, gradeId, phone } = req.body;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const student = new Student({ fullName, email, password, gradeId, phone });
    await student.save();

    res.status(201).json({
      message: 'Student registered successfully.',
      studentId: student._id
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: 'Invalid credentials' });
    if (student.status !== 'active') return res.status(403).json({ message: 'Account inactive' });

    const isMatch = await student.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    
    const token = jwt.sign(
      { id: student._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      studentId: student._id,
      fullName: student.fullName
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    const updates = req.body;

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updates,
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      student: updatedStudent
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deactivateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { status: 'inactive' },
      { new: true }
    );

    res.json({ message: 'Student deactivated', student });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};