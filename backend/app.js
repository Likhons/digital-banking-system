const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Render-এর মতো proxy-র পেছনে থাকলে আসল client IP পাওয়ার জন্য (rate limiter এটা ব্যবহার করে)
app.set('trust proxy', 1);

// FRONTEND_URL সেট থাকলে শুধু ওই URL (কমা দিয়ে একাধিক) থেকে request নেওয়া হবে
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim().replace(/\/$/, ''))
  : true;
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// UptimeRobot ping-এর জন্য। ইচ্ছা করে DB-তে query করে না,
// নাহলে প্রতি ping-এ Neon জেগে থাকবে আর free compute hours শেষ হয়ে যাবে
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: Math.round(process.uptime()) });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/profile', profileRoutes);

// ১. অজানা/ভুল API রুটে কল করলে 404 হ্যান্ডলার
app.use('/api', (req, res) => {
  res.status(404).json({ status: 'ERROR', message: 'Route not found' });
});

// ২. কোনো রুটে অপ্রত্যাশিত কোনো সার্ভার এরর হলে Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ status: 'ERROR', message: 'Something went wrong on the server' });
});

module.exports = app;