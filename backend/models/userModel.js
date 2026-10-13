const pool = require('../config/db');

const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

const createUser = async (name, email, hashedPassword, phone, db = pool) => {
  const [result] = await db.query(
    'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, phone || null]
  );
  return result.insertId;
};

const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

const updateUserProfile = async (id, name, phone) => {
  await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, id]);
};

const updateUserPassword = async (id, hashedPassword) => {
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
};

module.exports = { findUserByEmail, createUser, findUserById, updateUserProfile, updateUserPassword };