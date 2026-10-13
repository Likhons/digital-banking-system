const pool = require('../config/db');

const findAccountByNumber = async (accountNumber) => {
  const { rows } = await pool.query(
    'SELECT id, user_id, account_number FROM accounts WHERE account_number = $1',
    [accountNumber]
  );
  return rows[0];
};

const findBeneficiary = async (userId, accountNumber) => {
  const { rows } = await pool.query(
    'SELECT id FROM beneficiaries WHERE user_id = $1 AND account_number = $2',
    [userId, accountNumber]
  );
  return rows[0];
};

const createBeneficiary = async (userId, name, accountNumber) => {
  const { rows } = await pool.query(
    'INSERT INTO beneficiaries (user_id, name, account_number) VALUES ($1, $2, $3) RETURNING id',
    [userId, name, accountNumber]
  );
  return rows[0].id;
};

const getBeneficiariesByUserId = async (userId) => {
  const { rows } = await pool.query(
    'SELECT id, name, account_number, created_at FROM beneficiaries WHERE user_id = $1 ORDER BY created_at DESC, id DESC',
    [userId]
  );
  return rows;
};

const deleteBeneficiary = async (id, userId) => {
  const { rowCount } = await pool.query(
    'DELETE FROM beneficiaries WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rowCount;
};

module.exports = {
  findAccountByNumber,
  findBeneficiary,
  createBeneficiary,
  getBeneficiariesByUserId,
  deleteBeneficiary,
};
