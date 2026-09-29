const pool = require('../config/db');

const findAccountByNumber = async (accountNumber) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, account_number FROM accounts WHERE account_number = ?',
    [accountNumber]
  );
  return rows[0];
};

const findBeneficiary = async (userId, accountNumber) => {
  const [rows] = await pool.query(
    'SELECT id FROM beneficiaries WHERE user_id = ? AND account_number = ?',
    [userId, accountNumber]
  );
  return rows[0];
};

const createBeneficiary = async (userId, name, accountNumber) => {
  const [result] = await pool.query(
    'INSERT INTO beneficiaries (user_id, name, account_number) VALUES (?, ?, ?)',
    [userId, name, accountNumber]
  );
  return result.insertId;
};

const getBeneficiariesByUserId = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, name, account_number, created_at FROM beneficiaries WHERE user_id = ? ORDER BY created_at DESC, id DESC',
    [userId]
  );
  return rows;
};

const deleteBeneficiary = async (id, userId) => {
  const [result] = await pool.query(
    'DELETE FROM beneficiaries WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows;
};

module.exports = {
  findAccountByNumber,
  findBeneficiary,
  createBeneficiary,
  getBeneficiariesByUserId,
  deleteBeneficiary,
};