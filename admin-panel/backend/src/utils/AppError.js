/**
 * AppError — operational error with HTTP status code and error code.
 *
 * Usage:
 *   throw new AppError('Not found', 404, 'RESOURCE_NOT_FOUND');
 *   throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;