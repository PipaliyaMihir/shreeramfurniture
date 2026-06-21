const mongoose = require('mongoose');

const heroConfigSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Crafted with Passion,\nBuilt to Last' },
    subtitle: { type: String, default: 'Premium custom furniture & on-site carpentry contracting' },
    ctaText: { type: String, default: 'Explore Our Work' },
    ctaLink: { type: String, default: '#projects' },
  },
  { timestamps: true }
);

const HeroConfigModel = mongoose.model('HeroConfig', heroConfigSchema);
const { wrapModel } = require('../utils/dbFallback');

const defaultHeroConfig = [
  {
    title: 'Crafted with Passion,\nBuilt to Last',
    subtitle: 'Premium custom furniture & on-site carpentry contracting for homes and offices',
    ctaText: 'Explore Our Work',
    ctaLink: '#projects',
  }
];

module.exports = wrapModel(HeroConfigModel, 'HeroConfig', defaultHeroConfig);
