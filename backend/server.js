const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const receiptRoutes = require('./routes/receipts');

dotenv.config();

// Fail fast if critical secrets are missing rather than crashing on first request.
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

connectDB();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow same-origin/non-browser requests (no origin), Vercel deployments and local dev.
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
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

// Unknown route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Central error handler — catches thrown errors (incl. CORS rejections)
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SlipSafe server running on port ${PORT}`);
});

module.exports = app;