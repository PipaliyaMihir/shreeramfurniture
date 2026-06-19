const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const HeroSlide = require('./models/HeroSlide');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connected for seeding');
};

const categories = [
  { name: 'Sofa & Seating', slug: 'sofa-seating', icon: '🛋️', description: 'Premium comfort sofas and seating', order: 1 },
  { name: 'Bedroom', slug: 'bedroom', icon: '🛏️', description: 'Elegant bedroom furniture', order: 2 },
  { name: 'Dining', slug: 'dining', icon: '🍽️', description: 'Beautiful dining sets', order: 3 },
  { name: 'Office', slug: 'office', icon: '💼', description: 'Modern office furniture', order: 4 },
  { name: 'Storage', slug: 'storage', icon: '🗄️', description: 'Smart storage solutions', order: 5 },
  { name: 'Outdoor', slug: 'outdoor', icon: '🌿', description: 'Durable outdoor furniture', order: 6 },
];

const products = [
  {
    name: 'Royal Comfort 3-Seater Sofa',
    description: 'Luxurious 3-seater sofa with premium fabric upholstery and solid wood legs. Perfect for your living room.',
    price: 45999,
    originalPrice: 55000,
    category: 'Sofa & Seating',
    images: [],
    featured: true,
    material: 'Teak Wood + Premium Fabric',
    dimensions: '220cm x 90cm x 85cm',
    rating: 4.8,
    reviewCount: 124,
    tags: ['sofa', 'living room', 'fabric'],
  },
  {
    name: 'Maharaja King Size Bed',
    description: 'Grand king-size bed with intricate wooden carvings and a premium mattress base. Built to last a lifetime.',
    price: 62000,
    originalPrice: 75000,
    category: 'Bedroom',
    images: [],
    featured: true,
    material: 'Sheesham Wood',
    dimensions: '200cm x 180cm x 120cm',
    rating: 4.9,
    reviewCount: 89,
    tags: ['bed', 'bedroom', 'king size'],
  },
  {
    name: 'Heritage Dining Set (6 Seater)',
    description: '6-seater solid wood dining table with matching chairs. Features beautiful grain patterns and lacquer finish.',
    price: 78500,
    originalPrice: 95000,
    category: 'Dining',
    images: [],
    featured: true,
    material: 'Mango Wood',
    dimensions: '180cm x 90cm x 76cm',
    rating: 4.7,
    reviewCount: 67,
    tags: ['dining', 'table', 'chairs'],
  },
  {
    name: 'Executive Office Desk',
    description: 'Premium L-shaped executive desk with built-in storage drawers and cable management system.',
    price: 28500,
    originalPrice: 35000,
    category: 'Office',
    images: [],
    featured: false,
    material: 'Engineered Wood + MDF',
    dimensions: '160cm x 140cm x 75cm',
    rating: 4.6,
    reviewCount: 45,
    tags: ['office', 'desk', 'workspace'],
  },
  {
    name: 'Wooden Wardrobe with Mirror',
    description: '3-door wardrobe with full-length mirror, multiple shelves and hanging sections for complete organization.',
    price: 35000,
    originalPrice: 42000,
    category: 'Bedroom',
    images: [],
    featured: false,
    material: 'Teak Wood',
    dimensions: '180cm x 55cm x 210cm',
    rating: 4.5,
    reviewCount: 78,
    tags: ['wardrobe', 'bedroom', 'storage'],
  },
  {
    name: 'Bookshelf Cabinet',
    description: 'Elegant 5-tier bookshelf with adjustable shelves. Perfect for home library or office.',
    price: 12500,
    originalPrice: 16000,
    category: 'Storage',
    images: [],
    featured: false,
    material: 'Sheesham Wood',
    dimensions: '100cm x 35cm x 180cm',
    rating: 4.4,
    reviewCount: 56,
    tags: ['bookshelf', 'storage', 'office'],
  },
  {
    name: 'Garden Outdoor Chair Set',
    description: 'Weather-resistant 4-chair set with table for outdoor use. Perfect for balcony, garden, or patio.',
    price: 18000,
    originalPrice: 22000,
    category: 'Outdoor',
    images: [],
    featured: false,
    material: 'Teak Wood (Weather Treated)',
    dimensions: 'Chair: 60cm x 60cm x 90cm',
    rating: 4.6,
    reviewCount: 34,
    tags: ['outdoor', 'garden', 'chair'],
  },
  {
    name: 'Premium L-Shape Sofa',
    description: 'Modern L-shaped corner sofa with premium leatherette finish and ottoman. The centerpiece of any living room.',
    price: 68000,
    originalPrice: 85000,
    category: 'Sofa & Seating',
    images: [],
    featured: true,
    material: 'Solid Wood + Leatherette',
    dimensions: '280cm x 200cm x 85cm',
    rating: 4.9,
    reviewCount: 102,
    tags: ['sofa', 'L-shape', 'living room', 'leather'],
  },
];

const heroSlides = [
  {
    title: 'Crafted with Tradition,\nDesigned for Today',
    subtitle: 'Discover our exclusive collection of handcrafted wooden furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    ctaText: 'Explore Collection',
    ctaLink: '#products',
    order: 1,
    active: true,
  },
  {
    title: 'Transform Your\nLiving Space',
    subtitle: 'Premium quality furniture for every room in your home',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80',
    ctaText: 'Shop Now',
    ctaLink: '#products',
    order: 2,
    active: true,
  },
  {
    title: 'Bedroom Furniture\nOf Your Dreams',
    subtitle: 'Sleep in luxury with our handcrafted bedroom collections',
    image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1600&q=80',
    ctaText: 'View Bedroom',
    ctaLink: '#products',
    order: 3,
    active: true,
  },
];

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await HeroSlide.deleteMany({});

    // Create admin user (let pre-save hook hash the password)
    await User.create({
      name: 'Shree Ram Admin',
      email: process.env.ADMIN_EMAIL || 'admin@shreeramfurniture.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
    });
    console.log('✅ Admin user created');

    // Seed categories
    await Category.insertMany(categories);
    console.log('✅ Categories seeded');

    // Seed products
    await Product.insertMany(products);
    console.log('✅ Products seeded');

    // Seed hero slides
    await HeroSlide.insertMany(heroSlides);
    console.log('✅ Hero slides seeded');

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL || 'admin@shreeramfurniture.com'}`);
    console.log(`🔑 Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seed();
