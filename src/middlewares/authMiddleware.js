const { verifyToken } = require('../utils/jwt');
const response = require('../utils/response');

const authenticate = (req, res, next) => {
  try {
    // 1️⃣ Ambil header Authorization
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return response.unauthorized(res, 'Token tidak ditemukan');
    }

    // 2️⃣ Format header: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return response.unauthorized(res, 'Token tidak valid');
    }

    // 3️⃣ Verifikasi token
    const decoded = verifyToken(token);
    if (!decoded) {
      return response.unauthorized(res, 'Token tidak tidak valid atau kadaluwarsa');
    }

    // 4️⃣ Simpan data payload di request
    req.user = decoded; 
    next();
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};

module.exports = authenticate;
