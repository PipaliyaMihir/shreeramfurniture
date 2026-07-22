/**
 * seedAdmin.js — Creates the admin user after a clean wipe.
 * Run once with: node scripts/seedAdmin.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;

    // Check if admin already exists
    const existing = await db.collection('users').findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      console.log('ℹ️  Admin user already exists:', process.env.ADMIN_EMAIL);
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await db.collection('users').insertOne({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Admin user created!');
    console.log('   Email:   ', process.env.ADMIN_EMAIL);
    console.log('   Password:', process.env.ADMIN_PASSWORD);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
    process.exit(0);
  }
}

seedAdmin();
