const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const beneficiaryRoutes = require('./routes/beneficiaryRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

app.use(cors());
app.use(express.json());

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