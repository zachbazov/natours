const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/app-error');
const errorController = require('./controller/error-controller');
const tourRouter = require('./route/tour-routes');
const userRouter = require('./route/user-routes');

const app = express();

// Non-development-dependency - development logging middleware.
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));

// A middleware that exposes data to the request object.
app.use(express.json());

// Serving static files that are not defined, makes it accessible to the browser.
app.use(express.static(`${__dirname}/public`));

// Manipulates the request object, add the current time to the request.
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Error Handling
// In case a route hasn't found on the server.
app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on the server.`);
    // err.status = 'failure';
    // err.statusCode = 404;
    //next(err);
    next(new AppError(`Can't find ${req.originalUrl} on the server.`, 404));
});

// Global Error Handling Middleware
// In case we pass an argument to the next() function.
// Express will recognize it as an error.
// It skips all the middlewares on the middleware stack.
// Sends the argument that passed in, to the global error handling middleware.
app.use(errorController);

module.exports = app;
