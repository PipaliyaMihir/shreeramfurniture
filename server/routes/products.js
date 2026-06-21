const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, limit = 50, page = 1 } = req.query;
    const query = {};
    if (category && category !== 'all') query['categories.name'] = category;
    if (featured === 'true') query.featured = true;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/products/:id/rate (public)
router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const currentCount = product.reviewCount || 0;
    const currentRating = product.rating || 5;

    const newCount = currentCount + 1;
    const newRating = ((currentRating * currentCount) + ratingNum) / newCount;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        rating: Math.round(newRating * 10) / 10,
        reviewCount: newCount,
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/products (admin)
router.post('/', protect, async (req, res) => {
  try {
    if (req.body.categories && Array.isArray(req.body.categories)) {
      req.body.images = req.body.categories.reduce((acc, cat) => acc.concat(cat.images || []), []);
    }
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @PUT /api/products/:id (admin)
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.body.categories && Array.isArray(req.body.categories)) {
      req.body.images = req.body.categories.reduce((acc, cat) => acc.concat(cat.images || []), []);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @DELETE /api/products/:id (admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
