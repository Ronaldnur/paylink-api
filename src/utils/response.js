// utils/response.js
const response = (res, httpCode, statusCode, message, data = null) => {
  const result = {
    status: statusCode, // 0 = success, 108 = unauthorized, 102 = bad request, dll
    message,
    data,
  };

  return res.status(httpCode).json(result);
};

module.exports = {
  success: (res, message = "Success", data = null) => {
    return response(res, 200, 0, message, data);
  },

  badRequest: (res, message = "Bad Request", data = null) => {
    return response(res, 400, 102, message, data);
  },

  unauthorized: (res, message = "Unauthorized", data = null) => {
    return response(res, 401, 108, message, data);
  },

    unauthorized2: (res, message = "Unauthorized", data = null) => {
    return response(res, 401, 103, message, data);
  },

  forbidden: (res, message = "Forbidden", data = null) => {
    return response(res, 403, 109, message, data);
  },

  internalError: (res, message = "Internal Server Error", data = null) => {
    return response(res, 500, 999, message, data);
  }
};
