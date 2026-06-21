const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, required: true },
    ctaText: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '#products' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const HeroSlideModel = mongoose.model('HeroSlide', heroSlideSchema);
const { wrapModel } = require('../utils/dbFallback');

const defaultHeroSlides = [
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

module.exports = wrapModel(HeroSlideModel, 'HeroSlide', defaultHeroSlides);
