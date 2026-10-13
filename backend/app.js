const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Vercel-এর মতো proxy-র পেছনে থাকলে আসল client IP পাওয়ার জন্য (rate limiter এটা ব্যবহার করে)
app.set('trust proxy', 1);

// CORS_ORIGIN সেট থাকলে শুধু ওই frontend URL গুলো থেকে request নেওয়া হবে
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : true;
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Deploy ঠিক আছে কি না দেখার জন্য
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'DigiBank API is running' });
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