const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');
const { protect } = require('../middleware/auth');

// @GET /api/hero
router.get('/', async (req, res) => {
  try {
    const slides = await HeroSlide.find({ active: true }).sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/hero/all (admin - all slides)
router.get('/all', protect, async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/hero (admin)
router.post('/', protect, async (req, res) => {
  try {
    const slide = await HeroSlide.create(req.body);
    res.status(201).json(slide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @PUT /api/hero/:id (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json(slide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @DELETE /api/hero/:id (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
