const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/app-error');
const errorController = require('./controller/error-controller');
const tourRouter = require('./route/tour-routes');
const userRouter = require('./route/user-routes');

const app = express();

// Authentication Security HTTP Headers
// An Express app should always use the helmet package,
// due to lack of usage of security built-in measures.
// Best to use this helmet function early in the middleware stack,
// to ensure theses headers are sure to be set.
app.use(helmet());

// Non-development-dependency - development logging middleware.
if (process.env.NODE_ENV === 'development')
    app.use(morgan('dev'));

// Authentication Rate Limiting
// Count the number of requests, coming for an ip,
// then, when there are too many requests, blocks them.
const limiter = rateLimit({
    // max - requests number before limitation.
    max: 20,
    // windowMs - blocking time.
    windowMs: 60 * 60 * 1000,
    // message - as blocking occurs, display a message.
    message: 'Too many requests from this IP, please try again in an hour.'
});
// '/api' - applys to /api routes.
app.use('/api', limiter);

// Body Parsers
// Reads data from the body into req.body.
// A middleware that exposes data to the request object.
// .json() accepts an options object.
app.use(express.json({ limit: '10kb' }));

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
