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
  origin: ['https://slipsafe.vercel.app', 'http://localhost:5173'],
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