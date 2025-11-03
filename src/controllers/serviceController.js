const serviceService = require('../services/serviceService');
const response = require('../utils/response');

const getServices = async (req, res) => {
  try {
    const result = await serviceService.getAllServices();

    if (!result.success) {
      return response.badRequest(res, result.message);
    }

    return response.success(res, 'Sukses', result.data);
  } catch (err) {
    console.error(err);
    return response.internalError(res, 'Terjadi kesalahan server');
  }
};



module.exports = { getServices};
