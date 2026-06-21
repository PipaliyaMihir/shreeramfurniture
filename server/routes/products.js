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

// @GET /api/products/reviews/recent — get latest reviews across all products
// MUST be placed BEFORE /:id to avoid conflict
router.get('/reviews/recent', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(50);
    // Collect all reviews from all products
    const allReviews = [];
    products.forEach(product => {
      if (product.reviews && product.reviews.length > 0) {
        product.reviews.forEach(review => {
          allReviews.push({
            _id: review._id,
            name: review.name,
            rating: review.rating,
            message: review.message,
            projectName: product.name,
            projectId: product._id,
            createdAt: review.createdAt,
          });
        });
      }
    });
    // Sort by most recent and return top 6
    allReviews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    res.json(allReviews.slice(0, 6));
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

// @POST /api/products/:id/rate — submit a review (requires login)
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, name, message } = req.body;

    if (!rating || !name || !message) {
      return res.status(400).json({ message: 'Rating, name, and message are required' });
    }

    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Add the new review
    const newReview = {
      name: name.trim(),
      rating: ratingNum,
      message: message.trim(),
      userId: req.user._id ? String(req.user._id) : null,
      createdAt: new Date(),
    };

    // Build updated reviews list for rating calculation
    const currentReviews = product.reviews || [];
    const updatedReviews = [...currentReviews, newReview];

    // Recalculate average rating from all reviews
    const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $push: { reviews: newReview },
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: updatedReviews.length,
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
