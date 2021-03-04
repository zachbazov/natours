const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const sendErrorProd = (err, res) => {
    // Operational, trusted error, sends message to client.
    if (err.isOperational)
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    // Programming or unknown error, doesn't leak error.
    else {
        // 1) Log the error.
        console.error('[ERROR]', err);
        // 2) Send generic message.
        res.status(500).json({
            status: 'error',
            message: 'Internal Error'
        });
    }
}

// Error Types Handler
module.exports = (err, req, res, next) => {
    //console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
    else if (process.env.NODE_ENV === 'production') sendErrorProd(err, res);
}