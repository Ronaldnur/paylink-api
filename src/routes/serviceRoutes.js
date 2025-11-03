const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const serviceController = require('../controllers/serviceController');

// GET /services
router.get('/services', authenticate,serviceController.getServices);

module.exports = router;
