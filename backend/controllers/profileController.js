const bcrypt = require('bcryptjs');
const { findUserById, updateUserProfile, updateUserPassword } = require('../models/userModel');

const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'ERROR', message: 'User not found' });
    }
    res.status(200).json({
      status: 'OK',
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, created_at: user.created_at },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ status: 'ERROR', message: 'Name is required' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ status: 'ERROR', message: 'Name must be under 100 characters' });
    }

    const cleanPhone = phone ? String(phone).trim() : null;
    if (cleanPhone && !/^\+?\d{7,15}$/.test(cleanPhone)) {
      return res.status(400).json({ status: 'ERROR', message: 'Phone must be 7 to 15 digits' });
    }

    await updateUserProfile(req.user.id, name.trim(), cleanPhone);

    res.status(200).json({
      status: 'OK',
      message: 'Profile updated',
      user: { id: req.user.id, name: name.trim(), phone: cleanPhone },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to update profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (typeof currentPassword !== 'string' || !currentPassword || !newPassword) {
      return res.status(400).json({ status: 'ERROR', message: 'Current and new password are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ status: 'ERROR', message: 'New password must be at least 6 characters' });
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: 'ERROR', message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'ERROR', message: 'Current password is incorrect' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ status: 'ERROR', message: 'New password must be different from the current one' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await updateUserPassword(req.user.id, hashedPassword);

    res.status(200).json({ status: 'OK', message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to change password' });
  }
};

module.exports = { getProfile, updateProfile, changePassword };