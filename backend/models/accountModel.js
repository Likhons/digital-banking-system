const pool = require('../config/db');
const generateAccountNumber = require('../utils/generateAccountNumber');

const createAccount = async (userId) => {
  const accountNumber = generateAccountNumber();
  const [result] = await pool.query(
    'INSERT INTO accounts (user_id, account_number, balance) VALUES (?, ?, ?)',
    [userId, accountNumber, 0.00]
  );
  return { accountId: result.insertId, accountNumber };
};

const findAccountByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, account_number, account_type, balance, status, created_at FROM accounts WHERE user_id = ?',
    [userId]
  );
  return rows[0];
};

module.exports = { createAccount, findAccountByUserId };