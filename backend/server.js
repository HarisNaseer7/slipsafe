const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const receiptRoutes = require('./routes/receipts');

connectDB();

const app = express();

import cors from 'cors'

app.use(cors({
  origin: 'https://slipsafe.vercel.app',
  credentials: true
}))

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