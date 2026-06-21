const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const HeroSlide = require('./models/HeroSlide');
const EmailConfig = require('./models/EmailConfig');
const Quotation = require('./models/Quotation');
const HeroConfig = require('./models/HeroConfig');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB Connected for seeding');
};

const categories = [
  { name: 'Kitchen', slug: 'kitchen', icon: '🍳', description: 'Modern modular kitchens', order: 1 },
  { name: 'Bedroom', slug: 'bedroom', icon: '🛏️', description: 'Luxurious bedroom designs', order: 2 },
  { name: 'Living Area', slug: 'living-area', icon: '🛋️', description: 'Beautiful living room designs', order: 3 },
  { name: 'TV Unit', slug: 'tv-unit', icon: '📺', description: 'Custom TV units and panels', order: 4 },
  { name: 'Dining', slug: 'dining', icon: '🍽️', description: 'Elegant dining rooms', order: 5 },
  { name: 'Office', slug: 'office', icon: '💼', description: 'Modern home office workspaces', order: 6 },
];

const products = [
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
        name: 'TV Unit', // Categorized as TV/Display unit type woodwork
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80']
      },
      {
        name: 'Dining', // Categorized under general display tables
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

const heroSlides = [
  {
    title: 'Crafted with Passion,\nBuilt to Last',
    subtitle: 'High-quality custom furniture & on-site carpentry contracting for homes and offices',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    ctaText: 'View Our Projects',
    ctaLink: '#products',
    order: 1,
    active: true,
  },
  {
    title: 'Modern Modular\nKitchen Solutions',
    subtitle: 'Bespoke designs tailored for style, utility, and durable performance',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80',
    ctaText: 'Explore Work',
    ctaLink: '#products',
    order: 2,
    active: true,
  },
  {
    title: 'Bespoke Custom\nFurniture & Carpentry',
    subtitle: 'Handcrafted furniture made directly on-site — bungalows, offices, and showrooms',
    image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=1600&q=80',
    ctaText: 'See Portfolio',
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
    await EmailConfig.deleteMany({});
    await Quotation.deleteMany({});
    await HeroConfig.deleteMany({});

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

    // Seed default hero configuration
    await HeroConfig.create({
      title: 'Crafted with Passion,\nBuilt to Last',
      subtitle: 'Premium custom furniture & on-site carpentry contracting for homes and offices',
      ctaText: 'Explore Our Work',
      ctaLink: '#projects',
    });
    console.log('✅ Default Hero Configuration seeded');

    // Seed default email settings
    await EmailConfig.create({
      subject: 'Thank you for requesting a quotation from Shree Ram Furniture!',
      body: 'Hello,\n\nThank you for reaching out to us. We have received your request for a custom furniture quotation. Please find attached our pricing catalog/brochure.\n\nBest regards,\nShree Ram Furniture Team',
      pdfUrl: ''
    });
    console.log('✅ Default Email Configuration seeded');

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
