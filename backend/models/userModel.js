const pool = require('../config/db');

const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

const createUser = async (name, email, hashedPassword, phone, db = pool) => {
  const { rows } = await db.query(
    'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id',
    [name, email, hashedPassword, phone || null]
  );
  return rows[0].id;
};

const findUserById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
};

const updateUserProfile = async (id, name, phone) => {
  await pool.query('UPDATE users SET name = $1, phone = $2 WHERE id = $3', [name, phone, id]);
};

const updateUserPassword = async (id, hashedPassword) => {
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
};

module.exports = { findUserByEmail, createUser, findUserById, updateUserProfile, updateUserPassword };
