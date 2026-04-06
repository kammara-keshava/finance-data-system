/**
 * Seed script — creates a default Admin user for testing.
 * Run once: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const email = 'test@gmail.com';
  const existing = await User.findOne({ email });

  if (existing) {
    // Make sure the existing user is active and not deleted
    existing.status = 'Active';
    existing.isDeleted = false;
    await existing.save();
    console.log('User already exists — ensured status is Active:', email);
  } else {
    const password = await bcrypt.hash('123456', 10);
    await User.create({
      name: 'Test Admin',
      email,
      password,
      role: 'Admin',
      status: 'Active',
      isDeleted: false,
    });
    console.log('Seed user created:', email, '/ password: 123456');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
