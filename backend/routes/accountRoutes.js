const express = require('express');
const router = express.Router();
const { getMyAccount } = require('../controllers/accountController');
const protect = require('../middleware/authMiddleware');

router.get('/me', protect, getMyAccount);

module.exports = router;