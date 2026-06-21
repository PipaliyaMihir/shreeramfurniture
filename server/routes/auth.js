const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'ShreeRamFurniture_SuperSecret_JWT_2024_Key_Fallback', { expiresIn: '7d' });

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    let user = await User.findOne({ email: cleanEmail });

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@shreeramfurniture.com').trim().toLowerCase();
    const adminPassword = (process.env.ADMIN_PASSWORD || 'Admin@123').trim();

    // Auto-create default admin if it doesn't exist and credentials match
    if (!user && cleanEmail === adminEmail && cleanPassword === adminPassword) {
      user = await User.create({
        name: 'Shree Ram Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log('💡 Auto-created default admin user on first login attempt.');
    }

    if (user && (await user.matchPassword(cleanPassword))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('❌ Login error details:', error);
    res.status(500).json({ message: error.message });
  }
});

// @POST /api/auth/register — public user registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) return res.status(400).json({ message: 'An account with this email already exists' });

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'user',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @GET /api/auth/me — get current logged-in user profile
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
