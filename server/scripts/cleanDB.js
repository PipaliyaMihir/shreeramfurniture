/**
 * cleanDB.js — Wipes ALL data from the database.
 * Run once with: node scripts/cleanDB.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function cleanDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    console.log('📋 Collections found:', names.join(', ') || '(none)');

    for (const name of names) {
      const result = await db.collection(name).deleteMany({});
      console.log(`🗑️  ${name}: deleted ${result.deletedCount} documents`);
    }

    console.log('\n✅ Database is now completely clean!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
    process.exit(0);
  }
}

cleanDatabase();
