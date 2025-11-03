const bannerService = require('../services/bannerService');
const response = require('../utils/response');

const getBanners = async (req, res) => {
  try {
    const result = await bannerService.getAllBanners();

    if (!result.success) {
      return response.badRequest(res, result.message);
    }

    return response.success(res, 'Sukses', result.data);
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};

module.exports = { getBanners };
