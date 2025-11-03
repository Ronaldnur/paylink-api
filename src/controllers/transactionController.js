const transactionService = require('../services/transactionService');
const response = require('../utils/response');

const getBalance = async (req, res) => {
  try {
    // Ambil userId dari JWT (assume sudah di middleware verifyToken)
    const userId = req.user?.data;

    if (!userId) {
      return response.unauthorized(res, 'Token tidak valid atau kadaluwarsa');
    }

    const result = await transactionService.getBalance({ userId });

    if (!result.success) {
      return response.badRequest(res, result.message);
    }

    return response.success(res, 'Get Balance Berhasil', result.data);
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};


const topUp = async (req, res) => {
  try {
    const userId = req.user?.data;
    if (!userId) {
      return response.unauthorized(res, 'Token tidak valid atau kadaluwarsa');
    }

    const { top_up_amount } = req.body;

    // validasi amount
    const amount = Number(top_up_amount);
    if (isNaN(amount) || amount <= 0) {
      return response.badRequest(res, 'Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0');
    }

    const result = await transactionService.topUpBalance({ userId, amount });

    if (!result.success) {
      return response.badRequest(res, result.message);
    }

    return response.success(res, 'Top Up Balance berhasil', result.data);
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};

const transaction = async (req, res) => {
  try {
    const userId = req.user?.data;
    if (!userId) {
      return response.unauthorized(res, 'Token tidak valid atau kadaluwarsa');
    }

    const { service_code } = req.body;
    if (!service_code) {
      return response.badRequest(res, 'Service code wajib diisi');
    }

    const result = await transactionService.createTransaction({ userId, service_code });

    if (!result.success) {
      return response.badRequest(res, result.message);
    }

    return response.success(res, 'Transaksi berhasil', result.data);
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};


const getHistory = async (req, res) => {
  try {
    const userId = req.user?.data;
    if (!userId) return response.unauthorized(res, 'Token tidak valid atau kadaluwarsa');

    const { limit, offset = 0 } = req.query;

    const result = await transactionService.getTransactionHistory({ userId, limit, offset });

    if (!result.success) return response.internalError(res, result.message);

    return response.success(res, 'Get History Berhasil', result.data);
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};

module.exports = { getBalance,topUp,transaction,getHistory};
