const AppError = require('../utils/app-error');

const handleCastErrorDb = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400); // 400 - bad request.
}

const handleDuplicateFieldsDb = err => {
    const message = `Duplicate fields value: ${err.keyValue.name}, please use another value.`;
    return new AppError(message, 400);
}

const handleValidationErrorDb = err => {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data. ${errors.join(' ')}`;
    return new AppError(message, 400);
}

const handleJwtError = () => new AppError('Invalid token, login to gain access.', 401);

const handleJwtExpiredError = () => new AppError('Your token has expired, login to gain access.', 401);

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        name: err.name,
        message: err.message,
        stack: err.stack
    });
}

const sendErrorProd = (err, res) => {
    // Operational, trusted error, sends message to client.
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
    // Programming or unknown error, doesn't leak error.
        // 1) Log the error.
        console.log('[ERROR]', err);
        // 2) Send generic message.
        res.status(500).json({
            status: 'error',
            message: 'Internal Error'
        });
    }
}

// Error Types Handler
// Marks errors as operational, isOperational = true.
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
    else if (process.env.NODE_ENV === 'production') {
        let error = Object.assign(err);
        //console.error(error.name, error);
        if (error.name === 'CastError') error = handleCastErrorDb(error);
        if (error.name === 'MongoError' && error.code === 11000) error = handleDuplicateFieldsDb(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDb(error);
        if (error.name === 'JsonWebTokenError') error = handleJwtError();
        if (error.name === 'TokenExpiredError') error = handleJwtExpiredError();
        sendErrorProd(error, res);
    }
}