const pool = require('../config/db');

const depositMoney = async (userId, amount) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: accounts } = await client.query(
      'SELECT id, balance, status FROM accounts WHERE user_id = $1 FOR UPDATE',
      [userId]
    );

    if (accounts.length === 0) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    const account = accounts[0];

    if (account.status !== 'active') {
      throw new Error('ACCOUNT_NOT_ACTIVE');
    }

    const { rows: updated } = await client.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING balance',
      [amount, account.id]
    );

    await client.query(
      'INSERT INTO transactions (account_id, type, amount, reference, status) VALUES ($1, $2, $3, $4, $5)',
      [account.id, 'deposit', amount, 'Cash deposit', 'success']
    );

    await client.query('COMMIT');
    return updated[0].balance;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const withdrawMoney = async (userId, amount) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: accounts } = await client.query(
      'SELECT id, balance, status FROM accounts WHERE user_id = $1 FOR UPDATE',
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

    const { rows: updated } = await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2 RETURNING balance',
      [amount, account.id]
    );

    await client.query(
      'INSERT INTO transactions (account_id, type, amount, reference, status) VALUES ($1, $2, $3, $4, $5)',
      [account.id, 'withdrawal', amount, 'Cash withdrawal', 'success']
    );

    await client.query('COMMIT');
    return updated[0].balance;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const transferMoney = async (userId, receiverAccountNumber, amount) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: senderRows } = await client.query(
      'SELECT id, account_number FROM accounts WHERE user_id = $1',
      [userId]
    );
    if (senderRows.length === 0) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    const { rows: receiverRows } = await client.query(
      'SELECT id, account_number FROM accounts WHERE account_number = $1',
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

    const { rows: lockedRows } = await client.query(
      'SELECT id, balance, status FROM accounts WHERE id IN ($1, $2) ORDER BY id FOR UPDATE',
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

    const { rows: updated } = await client.query(
      'UPDATE accounts SET balance = balance - $1 WHERE id = $2 RETURNING balance',
      [amount, sender.id]
    );
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, receiver.id]);

    await client.query(
      'INSERT INTO transactions (account_id, type, amount, reference, status) VALUES ($1, $2, $3, $4, $5)',
      [sender.id, 'transfer_out', amount, `Transfer to ${receiver.account_number}`, 'success']
    );
    await client.query(
      'INSERT INTO transactions (account_id, type, amount, reference, status) VALUES ($1, $2, $3, $4, $5)',
      [receiver.id, 'transfer_in', amount, `Transfer from ${sender.account_number}`, 'success']
    );

    await client.query('COMMIT');
    return updated[0].balance;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getTransactionsByUserId = async (userId, limit, offset) => {
  const numLimit = Number(limit);
  const numOffset = Number(offset);

  const { rows } = await pool.query(
    `SELECT t.id, t.type, t.amount, t.reference, t.status, t.created_at
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = $1
     ORDER BY t.created_at DESC, t.id DESC
     LIMIT $2 OFFSET $3`,
    [userId, numLimit, numOffset]
  );

  // Postgres-এ COUNT(*) bigint (string) রিটার্ন করে, তাই int-এ cast করা হলো
  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM transactions t
     JOIN accounts a ON t.account_id = a.id
     WHERE a.user_id = $1`,
    [userId]
  );

  return { transactions: rows, total: countRows[0].total };
};

module.exports = { depositMoney, withdrawMoney, transferMoney, getTransactionsByUserId };
