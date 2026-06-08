const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Brand sends receipt to customer
router.post('/send', protect, async (req, res) => {
  try {
    const { customerEmail, location, items, paymentMethod, category } = req.body;
    const brandName = req.body.brandName || req.user.brandName;

    if (!customerEmail) {
      return res.status(400).json({ success: false, message: 'Customer email is required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    // Normalise items and compute the total on the server — never trust the client total.
    const normalizedItems = items.map((item) => ({
      name: item.name,
      quantity: Number(item.quantity) || 0,
      price: Number(item.price) || 0,
    }));
    const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const customer = await User.findOne({ email: customerEmail });
    const receipt = await Receipt.create({
      brandName,
      location,
      items: normalizedItems,
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

// Get single receipt — only the customer it belongs to or the brand that sent it
router.get('/:id', protect, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found' });

    const userId = req.user._id.toString();
    const isOwner =
      receipt.customer?.toString() === userId ||
      receipt.sentBy?.toString() === userId ||
      receipt.customerEmail === req.user.email;
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this receipt' });
    }

    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;