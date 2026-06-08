const { protect } = require('../middleware/authMiddleware')
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, brandName } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });
    const user = await User.create({ name, email, password, role, brandName });
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, brandName: user.brandName }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, brandName: user.brandName }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/products — fetch brand's products & info
router.get('/products', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      products: user.products || [],
      location: user.location || '',
      category: user.category || 'Shopping'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/products — save brand setup
router.post('/products', protect, async (req, res) => {
  try {
    const { brandName, location, category, products } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { brandName, location, category, products },
      { new: true }
    );
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, brandName: user.brandName }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;