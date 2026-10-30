const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Custom AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }
  // Mongoose duplicate key (E11000)
  else if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    code = 'DUPLICATE_KEY';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 409;
    details = err.keyValue;
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    code = 'VALIDATION_ERROR';
    details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = details.map((d) => d.message).join(', ') || 'Validation failed';
    statusCode = 400;
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
    statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
    statusCode = 401;
  }
  // Mongoose cast error (invalid ObjectId)
  else if (err.name === 'CastError') {
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // Structured response: backward compatible top-level message + new structured error object
  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      message,
      details,
    },
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
