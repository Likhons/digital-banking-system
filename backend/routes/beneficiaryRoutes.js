const express = require('express');
const router = express.Router();
const { addBeneficiary, getBeneficiaries, removeBeneficiary } = require('../controllers/beneficiaryController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getBeneficiaries);
router.post('/', protect, addBeneficiary);
router.delete('/:id', protect, removeBeneficiary);

module.exports = router;