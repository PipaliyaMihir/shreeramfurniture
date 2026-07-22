/**
 * seedCategories.js — Seeds the 8 specified categories into MongoDB.
 * Run once with: node scripts/seedCategories.js
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const defaultCategories = [
  { name: 'Living Area', slug: 'living-area', icon: '🛋️', description: 'Spacious and Elegant Living Area', order: 1 },
  { name: 'Kitchen', slug: 'kitchen', icon: '🍽️', description: 'Bright and Functional Kitchen', order: 2 },
  { name: 'TV Unit', slug: 'tv-unit', icon: '📺', description: 'Modern Entertainment Corner', order: 3 },
  { name: 'Bedrooms', slug: 'bedrooms', icon: '🛏️', description: 'Designed for Restful Living', order: 4 },
  { name: 'Wardrobes', slug: 'wardrobes', icon: '🚪', description: 'Smart Storage with Style', order: 5 },
  { name: 'Dining Area', slug: 'dining-area', icon: '🍽️', description: 'Perfect Space for Togetherness', order: 6 },
  { name: 'Pooja Unit', slug: 'pooja-unit', icon: '🛕', description: 'Peaceful Corner for Devotion', order: 7 },
  { name: 'Other Interiors', slug: 'other-interiors', icon: '✨', description: 'Thoughtfully Designed Every Corner', order: 8 },
];

async function seedCategories() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;

    // Delete old categories & insert fresh default ones
    await db.collection('categories').deleteMany({});
    
    const docs = defaultCategories.map(c => ({
      ...c,
      image: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await db.collection('categories').insertMany(docs);
    console.log(`✅ Successfully seeded ${result.insertedCount} categories into database:`);
    defaultCategories.forEach(c => {
      console.log(`   ${c.icon} ${c.name} — "${c.description}"`);
    });

  } catch (err) {
    console.error('❌ Error seeding categories:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected.');
    process.exit(0);
  }
}

seedCategories();
