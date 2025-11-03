// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { put } = require('@vercel/blob');
const path = require('path');
const fs = require('fs');
const authenticate = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// register route
router.post('/registration', userController.register);
router.post('/login', userController.login);
router.get('/profile', authenticate,userController.profile);
router.put('/profile/update', authenticate,userController.updateProfile);

const upload = multer({ storage: multer.memoryStorage() });
router.put('/profile/image', authenticate, upload.single('file'), userController.updatePicture);

module.exports = router;
