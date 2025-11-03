const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticate = require('../middlewares/authMiddleware');

// GET /balance → private route
router.get('/balance', authenticate, transactionController.getBalance);
router.post('/topup', authenticate, transactionController.topUp);
router.post('/transaction', authenticate, transactionController.transaction);
router.get('/transaction/history', authenticate, transactionController.getHistory);
module.exports = router;
