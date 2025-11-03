// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticate = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// register route
router.post('/registration', userController.register);
router.post('/login', userController.login);
router.get('/profile', authenticate,userController.profile);
router.put('/profile/update', authenticate,userController.updateProfile);


const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `profile-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// Filter file: hanya jpeg & png
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format Image tidak sesuai'));
  }
};

const upload = multer({ storage, fileFilter });


// Route update profile image
router.put('/profile/image', authenticate, upload.single('file'), (req, res) => {
  // multer otomatis handle error file type
  userController.updatePicture(req, res);
});

module.exports = router;
