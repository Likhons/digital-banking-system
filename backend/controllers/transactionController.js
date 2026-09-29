const { depositMoney, withdrawMoney, transferMoney, getTransactionsByUserId } = require('../models/transactionModel');

const deposit = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!req.body.amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ status: 'ERROR', message: 'Amount must be a number greater than zero' });
    }

    if (!/^\d+(\.\d{1,2})?$/.test(String(req.body.amount))) {
      return res.status(400).json({ status: 'ERROR', message: 'Amount can have at most 2 decimal places' });
    }

    const newBalance = await depositMoney(req.user.id, amount);

    res.status(200).json({
      status: 'OK',
      message: 'Deposit successful',
      balance: newBalance,
    });

  } catch (error) {
    if (error.message === 'ACCOUNT_NOT_FOUND') {
      return res.status(404).json({ status: 'ERROR', message: 'Account not found' });
    }
    if (error.message === 'ACCOUNT_NOT_ACTIVE') {
      return res.status(403).json({ status: 'ERROR', message: 'Account is not active' });
    }
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Deposit failed' });
  }
};

const withdraw = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!req.body.amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ status: 'ERROR', message: 'Amount must be a number greater than zero' });
    }

    if (!/^\d+(\.\d{1,2})?$/.test(String(req.body.amount))) {
      return res.status(400).json({ status: 'ERROR', message: 'Amount can have at most 2 decimal places' });
    }

    const newBalance = await withdrawMoney(req.user.id, amount);

    res.status(200).json({
      status: 'OK',
      message: 'Withdrawal successful',
      balance: newBalance,
    });

  } catch (error) {
    if (error.message === 'ACCOUNT_NOT_FOUND') {
      return res.status(404).json({ status: 'ERROR', message: 'Account not found' });
    }
    if (error.message === 'ACCOUNT_NOT_ACTIVE') {
      return res.status(403).json({ status: 'ERROR', message: 'Account is not active' });
    }
    if (error.message === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({ status: 'ERROR', message: 'Insufficient balance' });
    }
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Withdrawal failed' });
  }
};

const transfer = async (req, res) => {
  try {
    const { receiverAccountNumber } = req.body;
    const amount = Number(req.body.amount);

    if (!receiverAccountNumber || typeof receiverAccountNumber !== 'string' || !receiverAccountNumber.trim()) {
      return res.status(400).json({ status: 'ERROR', message: 'Receiver account number is required' });
    }

    if (!req.body.amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ status: 'ERROR', message: 'Amount must be a number greater than zero' });
    }

    if (!/^\d+(\.\d{1,2})?$/.test(String(req.body.amount))) {
      return res.status(400).json({ status: 'ERROR', message: 'Amount can have at most 2 decimal places' });
    }

    const newBalance = await transferMoney(req.user.id, receiverAccountNumber.trim(), amount);

    res.status(200).json({
      status: 'OK',
      message: 'Transfer successful',
      balance: newBalance,
    });

  } catch (error) {
    const knownErrors = {
      ACCOUNT_NOT_FOUND: [404, 'Your account was not found'],
      RECEIVER_NOT_FOUND: [404, 'Receiver account not found'],
      SAME_ACCOUNT: [400, 'You cannot transfer money to your own account'],
      ACCOUNT_NOT_ACTIVE: [403, 'Your account is not active'],
      RECEIVER_NOT_ACTIVE: [400, 'Receiver account is not active'],
      INSUFFICIENT_BALANCE: [400, 'Insufficient balance'],
    };

    if (knownErrors[error.message]) {
      const [statusCode, message] = knownErrors[error.message];
      return res.status(statusCode).json({ status: 'ERROR', message });
    }

    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Transfer failed' });
  }
};

const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({ status: 'ERROR', message: 'Page and limit must be positive numbers' });
    }

    if (limit > 50) limit = 50;

    const offset = (page - 1) * limit;
    const { transactions, total } = await getTransactionsByUserId(req.user.id, limit, offset);

    res.status(200).json({
      status: 'OK',
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch transactions' });
  }
};

module.exports = { deposit, withdraw, transfer, getTransactions };