// controllers/userController.js
const { put } = require('@vercel/blob');
const response = require('../utils/response');
const userService = require('../services/userService');
const { generateToken, verifyToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password) {
      return response.badRequest(res, "Email dan password wajib diisi");
    }
       // === VALIDASI 2: Format email ===
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response.badRequest(res, "Paramter email tidak sesuai format");
    }

    if (password.length < 8) {
      return response.badRequest(res, "Password minimal 8 karakter");
    }

    const result = await userService.registerUser({ email, password, first_name, last_name });

    if (!result.success) {
      return response.badRequest(res, result.message);
    }

    return response.success(res, "Registrasi berhasil silahkan login");
  } catch (err) {
    console.error("Register error:", err);
    return response.internalError(res, "Terjadi kesalahan pada server");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return response.badRequest(res, 'Paramter email tidak sesuai format');
    }
    // Validasi password
    if (!password || password.length < 8) {
      return response.badRequest(res, 'Password minimal 8 karakter');
    }

    // Panggil service dengan object
    const result = await userService.loginUser({ email, password });

    if (!result.success) {
      return response.unauthorized2(res, result.message);
    }

    // Generate JWT 12 jam
    const token = generateToken({ email: result.user.email, data: result.user.id });

    return response.success(res, 'Login Sukses', { token });
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};


const profile = async (req, res) => {
  try {
    // userId dari payload JWT
    const userId = req.user.data;

    const result = await userService.getUserProfile({ userId });

    if (!result.success) {
      return response.badRequest(res, result.message);
    }

    const user = {
      email: result.user.email,
      first_name: result.user.first_name,
      last_name: result.user.last_name,
      profile_image: result.user.image_url || null, // default null kalau belum ada
    };

    return response.success(res, 'Sukses', user);
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.data;
    const { first_name, last_name } = req.body;

    if (!first_name || !last_name) {
      return response.badRequest(res, 'first_name dan last_name wajib diisi');
    }

    const result = await userService.updateUserProfile({ userId, first_name, last_name });


    const UserUpdate= {
      email: result.user.email,
      first_name: result.user.first_name,
      last_name: result.user.last_name,
      profile_image: result.user.image_url || null, // default null kalau belum ada
    };

    if (!result.success) {
      return response.badRequest(res, result.message);
    }

    return response.success(res, 'Update Pofile berhasil', UserUpdate);
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};


const updatePicture = async (req, res) => {
  try {
    const userId = req.user.data;

    if (!req.file) {
      return response.badRequest(res, 'File harus diupload');
    }

    // URL file, misal disimpan lokal + base URL
    // Upload file ke Vercel Blob
    const blob = await put(`profile-${Date.now()}.jpg`, req.file.buffer, {
      access: 'public', // biar bisa diakses langsung
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const imageUrl = blob.url;

    const result = await userService.updateProfileImage({ userId,imageUrl});

    if (!result.success) {
      return response.badRequest(res, result.message);
    }

    // mapping field untuk response
    const user = {
      email: result.user.email,
      first_name: result.user.first_name,
      last_name: result.user.last_name,
      profile_image: result.user.image_url,
    };

    return response.success(res, 'Update Profile Image berhasil', user);
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};
module.exports = { register,login,profile,updateProfile,updatePicture};
