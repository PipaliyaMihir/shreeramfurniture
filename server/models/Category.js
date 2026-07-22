const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '🛋️' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const CategoryModel = mongoose.model('Category', categorySchema);
const { wrapModel } = require('../utils/dbFallback');

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

module.exports = wrapModel(CategoryModel, 'Category', defaultCategories);
