class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // create property for every new object that is right, and every object without this property means that have an error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
