const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  brandLogo: { type: String },
  location: { type: String },
  items: [{
    name: { type: String },
    quantity: { type: Number },
    price: { type: Number },
  }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerEmail: { type: String, required: true },
  category: { type: String, default: 'Shopping' },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);
