const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const receiptRoutes = require('./routes/receipts');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'SlipSafe server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SlipSafe server running on port ${PORT}`);
});

module.exports = app;