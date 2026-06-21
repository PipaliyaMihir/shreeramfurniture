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
  { name: 'Kitchen', slug: 'kitchen', icon: '🍳', description: 'Modern modular kitchens', order: 1 },
  { name: 'Bedroom', slug: 'bedroom', icon: '🛏️', description: 'Luxurious bedroom designs', order: 2 },
  { name: 'Living Area', slug: 'living-area', icon: '🛋️', description: 'Beautiful living room designs', order: 3 },
  { name: 'TV Unit', slug: 'tv-unit', icon: '📺', description: 'Custom TV units and panels', order: 4 },
  { name: 'Dining', slug: 'dining', icon: '🍽️', description: 'Elegant dining rooms', order: 5 },
  { name: 'Office', slug: 'office', icon: '💼', description: 'Modern home office workspaces', order: 6 },
];

module.exports = wrapModel(CategoryModel, 'Category', defaultCategories);
