const { findAccountByUserId } = require('../models/accountModel');

const getMyAccount = async (req, res) => {
  try {
    const account = await findAccountByUserId(req.user.id);

    if (!account) {
      return res.status(404).json({ status: 'ERROR', message: 'Account not found' });
    }

    res.status(200).json({ status: 'OK', account });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch account' });
  }
};

module.exports = { getMyAccount };