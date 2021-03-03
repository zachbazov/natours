const express = require('express');
const morgan = require('morgan');

const app = express();

const tourRouter = require('./route/tour-routes');
const userRouter = require('./route/user-routes');

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

module.exports = app;
