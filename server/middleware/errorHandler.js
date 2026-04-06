/**
 * Central Express error-handling middleware.
 * Maps known error types to appropriate HTTP status codes.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  }

  // Joi validation error
  if (err.isJoi === true || (err.name === 'ValidationError' && Array.isArray(err.details))) {
    statusCode = 422;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
  }

  const body = { success: false, error: message, statusCode };

  if (process.env.NODE_ENV === 'development') {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

module.exports = errorHandler;
