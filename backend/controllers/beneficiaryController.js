const {
  findAccountByNumber,
  findBeneficiary,
  createBeneficiary,
  getBeneficiariesByUserId,
  deleteBeneficiary,
} = require('../models/beneficiaryModel');

const addBeneficiary = async (req, res) => {
  try {
    const { name, accountNumber } = req.body;

    if (!name || !accountNumber || typeof name !== 'string' || typeof accountNumber !== 'string') {
      return res.status(400).json({ status: 'ERROR', message: 'Name and account number are required' });
    }

    const cleanName = name.trim();
    const cleanAccountNumber = accountNumber.trim();

    if (!cleanName || !cleanAccountNumber) {
      return res.status(400).json({ status: 'ERROR', message: 'Name and account number are required' });
    }

    // বেনিফিশিয়ারির নাম ১০০ অক্ষরের বেশি কি না যাচাই (Validation Tightening)
    if (cleanName.length > 100) {
      return res.status(400).json({ status: 'ERROR', message: 'Name must be under 100 characters' });
    }

    const account = await findAccountByNumber(cleanAccountNumber);
    if (!account) {
      return res.status(404).json({ status: 'ERROR', message: 'Account number does not exist' });
    }

    if (account.user_id === req.user.id) {
      return res.status(400).json({ status: 'ERROR', message: 'You cannot add your own account as a beneficiary' });
    }

    const existing = await findBeneficiary(req.user.id, cleanAccountNumber);
    if (existing) {
      return res.status(409).json({ status: 'ERROR', message: 'Beneficiary already saved' });
    }

    const id = await createBeneficiary(req.user.id, cleanName, cleanAccountNumber);

    res.status(201).json({
      status: 'OK',
      message: 'Beneficiary added',
      beneficiary: { id, name: cleanName, account_number: cleanAccountNumber },
    });

  } catch (error) {
    // একই সময়ে দুইবার add করলে UNIQUE (user_id, account_number) constraint ধরবে
    if (error.code === '23505') {
      return res.status(409).json({ status: 'ERROR', message: 'Beneficiary already saved' });
    }
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to add beneficiary' });
  }
};

const getBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await getBeneficiariesByUserId(req.user.id);
    res.status(200).json({ status: 'OK', beneficiaries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch beneficiaries' });
  }
};

const removeBeneficiary = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid beneficiary id' });
    }

    const affected = await deleteBeneficiary(id, req.user.id);

    if (affected === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Beneficiary not found' });
    }

    res.status(200).json({ status: 'OK', message: 'Beneficiary deleted' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to delete beneficiary' });
  }
};

module.exports = { addBeneficiary, getBeneficiaries, removeBeneficiary };