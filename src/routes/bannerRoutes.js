const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const bannerController = require('../controllers/bannerController');

// GET /banners
router.get('/banners', authenticate,bannerController.getBanners);

module.exports = router;
