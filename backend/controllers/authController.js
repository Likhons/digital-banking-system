const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { findUserByEmail, createUser } = require('../models/userModel');
const { createAccount } = require('../models/accountModel');

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // ১. প্রয়োজনীয় ফিল্ডগুলো আছে কি না এবং string কি না চেক করা
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ status: 'ERROR', message: 'Name, email, and password are required' });
    }

    // ২. নাম ও ইমেইল ক্লিন ও নরমালাইজ করা (স্পেস রিমুভ ও ছোট হাতের অক্ষরে রূপান্তর)
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? String(phone).trim() : null;

    if (!cleanName || !cleanEmail || !password) {
      return res.status(400).json({ status: 'ERROR', message: 'Name, email, and password are required' });
    }

    // ৩. নামের দৈর্ঘ্য সর্বোচ্চ ১০০ ক্যারেক্টারের মধ্যে কি না দেখা (Validation Tightening)
    if (cleanName.length > 100) {
      return res.status(400).json({ status: 'ERROR', message: 'Name must be under 100 characters' });
    }

    // ৪. ইমেইলের ফরম্যাট ও দৈর্ঘ্য সঠিক কি না যাচাই করা (Regex Validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleanEmail.length > 150 || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid email format' });
    }

    // ৫. পাসওয়ার্ডের দৈর্ঘ্য সর্বনিম্ন ৬ ক্যারেক্টার কি না দেখা
    if (password.length < 6) {
      return res.status(400).json({ status: 'ERROR', message: 'Password must be at least 6 characters' });
    }

    // ৬. ফোন নম্বরের ফরম্যাট সঠিক কি না দেখা (৭ থেকে ১৫ ডিজিট)
    if (cleanPhone && !/^\+?\d{7,15}$/.test(cleanPhone)) {
      return res.status(400).json({ status: 'ERROR', message: 'Phone must be 7 to 15 digits' });
    }

    // ৭. ইমেইল দিয়ে ইউজার আগে থেকেই আছে কি না চেক করা
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ status: 'ERROR', message: 'User already exists with this email' });
    }

    // ৮. পাসওয়ার্ড হ্যাশ করা
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ৯. ইউজার ও ব্যাংক অ্যাকাউন্ট একই DB transaction-এ তৈরি করা,
    //    যাতে অ্যাকাউন্ট তৈরি ফেইল করলে অ্যাকাউন্ট-ছাড়া ইউজার থেকে না যায়
    const client = await pool.connect();
    let userId;
    try {
      await client.query('BEGIN');
      userId = await createUser(cleanName, cleanEmail, hashedPassword, cleanPhone, client);
      await createAccount(userId, client);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    res.status(201).json({
      status: 'OK',
      message: 'User registered successfully',
      userId,
    });
  } catch (error) {
    // একই ইমেইলে একসাথে দুইটা রিকোয়েস্ট এলে UNIQUE constraint ধরবে
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      return res.status(400).json({ status: 'ERROR', message: 'User already exists with this email' });
    }
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ইমেইল ক্লিন ও নরমালাইজ করা
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({ status: 'ERROR', message: 'Email and password are required' });
    }

    const user = await findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ status: 'ERROR', message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'ERROR', message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: 'OK',
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Login failed' });
  }
};

const getMe = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'User not found' });
    }

    res.status(200).json({ status: 'OK', user: rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch user' });
  }
};

module.exports = { register, login, getMe };