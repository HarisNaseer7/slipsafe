const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Brand sends receipt to customer
router.post('/send', protect, async (req, res) => {
  try {
    const { customerEmail, location, items, total, paymentMethod, category } = req.body;
    const brandName = req.body.brandName || req.user.brandName;
    const customer = await User.findOne({ email: customerEmail });
    const receipt = await Receipt.create({
      brandName,
      location,
      items,
      total,
      paymentMethod,
      category,
      customerEmail,
      customer: customer ? customer._id : null,
      sentBy: req.user._id,
    });
    res.status(201).json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Customer gets their receipts
router.get('/my', protect, async (req, res) => {
  try {
    const receipts = await Receipt.find({
      $or: [
        { customer: req.user._id },
        { customerEmail: req.user.email }
      ]
    }).sort({ createdAt: -1 });
    res.json({ success: true, receipts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single receipt
router.get('/:id', protect, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });
    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;