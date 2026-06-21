const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // Site Name (e.g. Nand Prime)
    description: { type: String, default: '' }, // Site description / details
    categories: [
      {
        name: { type: String, required: true },
        images: [{ type: String }]
      }
    ],
    images: [{ type: String }], // Flat array of all category images, computed on save
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    // Keep price fields for database backward compatibility but make them optional
    price: { type: Number, default: 0 },
    originalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model('Product', productSchema);
const { wrapModel } = require('../utils/dbFallback');

const defaultProducts = [
  {
    name: 'Nand Prime Bungalow (Satellite)',
    description: 'Bespoke residential carpentry project completed for a luxury 3 BHK bungalow, featuring custom wood panelling, modular kitchen cabinets, sliding wardrobes, and LED-lit TV console panels built entirely on-site.',
    categories: [
      {
        name: 'Kitchen',
        images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80']
      },
      {
        name: 'Bedroom',
        images: ['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80']
      },
      {
        name: 'Living Area',
        images: ['https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80']
      },
      {
        name: 'TV Unit',
        images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80']
      }
    ],
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80'
    ],
    featured: true,
    rating: 4.9,
    reviewCount: 48,
    price: 0,
    originalPrice: 0
  },
  {
    name: 'Royal Residency Bungalow (Bopal)',
    description: 'Premium custom furniture and woodwork executed on-site for a high-end duplex bungalow, emphasizing handcrafted bed panels, custom dressing areas, a bespoke dining table, and living room seating structures.',
    categories: [
      {
        name: 'Bedroom',
        images: ['https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=80']
      },
      {
        name: 'Living Area',
        images: ['https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&q=80']
      },
      {
        name: 'Dining',
        images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80']
      }
    ],
    images: [
      'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=80',
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80'
    ],
    featured: true,
    rating: 4.8,
    reviewCount: 35,
    price: 0,
    originalPrice: 0
  },
  {
    name: 'Shree Ram Corporate Hub (Prahladnagar)',
    description: 'Modern office carpentry project featuring custom executive desks, library wall cabinets, storage units, conference room tables, and wooden acoustic paneling.',
    categories: [
      {
        name: 'Office',
        images: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80']
      },
      {
        name: 'Living Area',
        images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80']
      }
    ],
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80'
    ],
    featured: false,
    rating: 4.7,
    reviewCount: 22,
    price: 0,
    originalPrice: 0
  },
  {
    name: 'Shivalik Showroom (Gota)',
    description: 'High-end retail showroom carpentry layout containing customized product display racks, display cabinetry, and a large wooden reception desk counter.',
    categories: [
      {
        name: 'TV Unit',
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80']
      },
      {
        name: 'Dining',
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80']
      }
    ],
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
    ],
    featured: false,
    rating: 4.6,
    reviewCount: 19,
    price: 0,
    originalPrice: 0
  }
];

module.exports = wrapModel(ProductModel, 'Product', defaultProducts);
