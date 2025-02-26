// Class for handling response messages
class ResponseHandler {
  static success(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = "Error", statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static created(res, data = null, message = "Created successfully") {
    return this.success(res, data, message, 201);
  }

  static notFound(res, message = "Resource not found") {
    return this.error(res, message, 404);
  }

  static badRequest(res, message = "Bad request", errors = null) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res, message = "Unauthorized") {
    return this.error(res, message, 401);
  }
}

module.exports = { ResponseHandler };
