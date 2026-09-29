const pool = require('../config/db');

const depositMoney = async (userId, amount) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [accounts] = await connection.query(
      'SELECT id, balance, status FROM accounts WHERE user_id = ? FOR UPDATE',
      [userId]
    );

    if (accounts.length === 0) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    const account = accounts[0];

    if (account.status !== 'active') {
      throw new Error('ACCOUNT_NOT_ACTIVE');
    }

    await connection.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, account.id]
    );

    await connection.query(
      'INSERT INTO transactions (account_id, type, amount, reference, status) VALUES (?, ?, ?, ?, ?)',
      [account.id, 'deposit', amount, 'Cash deposit', 'success']
    );

    await connection.commit();

    const [updated] = await connection.query('SELECT balance FROM accounts WHERE id = ?', [account.id]);
    return updated[0].balance;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const withdrawMoney = async (userId, amount) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [accounts] = await connection.query(
      'SELECT id, balance, status FROM accounts WHERE user_id = ? FOR UPDATE',
      [userId]
    );

    if (accounts.length === 0) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    const account = accounts[0];

    if (account.status !== 'active') {
      throw new Error('ACCOUNT_NOT_ACTIVE');
    }

    if (Number(account.balance) < amount) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    await connection.query(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, account.id]
    );

    await connection.query(
      'INSERT INTO transactions (account_id, type, amount, reference, status) VALUES (?, ?, ?, ?, ?)',
      [account.id, 'withdrawal', amount, 'Cash withdrawal', 'success']
    );

    await connection.commit();

    const [updated] = await connection.query('SELECT balance FROM accounts WHERE id = ?', [account.id]);
    return updated[0].balance;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const transferMoney = async (userId, receiverAccountNumber, amount) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [senderRows] = await connection.query(
      'SELECT id, account_number FROM accounts WHERE user_id = ?',
      [userId]
    );
    if (senderRows.length === 0) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    const [receiverRows] = await connection.query(
      'SELECT id, account_number FROM accounts WHERE account_number = ?',
      [receiverAccountNumber]
    );
    if (receiverRows.length === 0) {
      throw new Error('RECEIVER_NOT_FOUND');
    }

    const sender = senderRows[0];
    const receiver = receiverRows[0];

    if (sender.id === receiver.id) {
      throw new Error('SAME_ACCOUNT');
    }

    const [lockedRows] = await connection.query(
      'SELECT id, balance, status FROM accounts WHERE id IN (?, ?) ORDER BY id FOR UPDATE',
      [sender.id, receiver.id]
    );
    const lockedSender = lockedRows.find((row) => row.id === sender.id);
    const lockedReceiver = lockedRows.find((row) => row.id === receiver.id);

    if (lockedSender.status !== 'active') {
      throw new Error('ACCOUNT_NOT_ACTIVE');
    }
    if (lockedReceiver.status !== 'active') {
      throw new Error('RECEIVER_NOT_ACTIVE');
    }
    if (Number(lockedSender.balance) < amount) {
      throw new Error('INSUFFICIENT_BALANCE');
    }

    await connection.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, sender.id]);
    await connection.query('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, receiver.id]);

    await connection.query(
      'INSERT INTO transactions (account_id, type, amount, reference, status) VALUES (?, ?, ?, ?, ?)',
      [sender.id, 'transfer_out', amount, `Transfer to ${receiver.account_number}`, 'success']
    );
    await connection.query(
      'INSERT INTO transactions (account_id, type, amount, reference, status) VALUES (?, ?, ?, ?, ?)',
      [receiver.id, 'transfer_in', amount, `Transfer from ${sender.account_number}`, 'success']
    );

    await connection.commit();

    const [updated] = await connection.query('SELECT balance FROM accounts WHERE id = ?', [sender.id]);
    return updated[0].balance;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getTransactionsByUserId = async (userId, limit, offset) => {
  const numLimit = Number(limit);
  const numOffset = Number(offset);

  const [rows] = await pool.query(
    `SELECT t.id, t.type, t.amount, t.reference, t.status, t.created_at
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = ?
     ORDER BY t.created_at DESC, t.id DESC
     LIMIT ? OFFSET ?`,
    [userId, numLimit, numOffset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = ?`,
    [userId]
  );

  return { transactions: rows, total: countRows[0].total };
};

module.exports = { depositMoney, withdrawMoney, transferMoney, getTransactionsByUserId };