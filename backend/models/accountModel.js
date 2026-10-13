const pool = require('../config/db');
const generateAccountNumber = require('../utils/generateAccountNumber');

const createAccount = async (userId, db = pool) => {
  const accountNumber = generateAccountNumber();
  const { rows } = await db.query(
    'INSERT INTO accounts (user_id, account_number, balance) VALUES ($1, $2, $3) RETURNING id',
    [userId, accountNumber, 0.00]
  );
  return { accountId: rows[0].id, accountNumber };
};

const findAccountByUserId = async (userId) => {
  const { rows } = await pool.query(
    'SELECT id, account_number, account_type, balance, status, created_at FROM accounts WHERE user_id = $1',
    [userId]
  );
  return rows[0];
};

module.exports = { createAccount, findAccountByUserId };
