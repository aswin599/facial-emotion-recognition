const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Adjust this path to your actual User/Admin model
const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin created:', admin);
  } catch (err) {
    console.error('Error creating admin:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();