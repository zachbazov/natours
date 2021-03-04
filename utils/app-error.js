class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'failure' : 'error';
        this.isOperational = true;
        // Wouldn't polute the stack trace.
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;