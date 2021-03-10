const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const csp = require('express-csp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/app-error');
const errorController = require('./controller/error-controller');
const tourRouter = require('./route/tour-routes');
const userRouter = require('./route/user-routes');
const reviewRouter = require('./route/review-routes');
const viewRouter = require('./route/view-routes');
const bookingRouter = require('./route/booking-routes');

const app = express();

// Server-Side Rendering - Pug
app.set('view engine', 'pug');

/* path - Is a built-in Note module, so a core module,
    which is used to manipulate path names.
Defines where these views are actually located in our file system.
So our pug templates are actually called views in Express */
app.set('views', path.join(__dirname, 'views'));

// Parses Data from URL Encoded Form.
// extended - Ability to send complex data.
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serving static files that are not defined, makes it accessible to the browser.
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Security HTTP Headers
// An Express app should always use the helmet package,
// due to lack of usage of security built-in measures.
// Best to use this helmet function early in the middleware stack,
// to ensure theses headers are sure to be set.
app.use(helmet());

// Content Security Policy.
csp.extend(app, {
    policy: {
        directives: {
            'default-src': ['self'],
            'style-src': ['self', 'unsafe-inline', 'https:'],
            'font-src': ['self', 'https://fonts.gstatic.com'],
            'script-src': [
                'self',
                'unsafe-inline',
                'data',
                'blob',
                'https://js.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:8828',
                'ws://localhost:56558/',
            ],
            'worker-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                'https://*.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:*',
                'ws://localhost:*/',
            ],
            'frame-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                'https://*.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:*',
                'ws://localhost:*/',
            ],
            'img-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                'https://*.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:*',
                'ws://localhost:*/',
            ],
            'connect-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                //'wss://<HEROKU-SUBDOMAIN>.herokuapp.com:<PORT>/',
                'https://*.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:*',
                'ws://localhost:*/',
                'ws://127.0.0.1:*/',
            ],
        },
    },
});

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

// Cookie Parser.
app.use(cookieParser());

// Express Security - Data Sanitization.
// Cleans all the data that comes to the application from malicious code.
// Data sanitization against NoSQL query injection,
// e.g { "email": { "$gt": "" } }, this injection will expose all the users, which is bad practice.
// To avoid this, we use a sanitizer,
// which looks at the req.body, req.query and req.params,
// and will filter out all the special signs or dots.
app.use(mongoSanitize());
// Data sanitization against XSS.
// Will clean any user input from malicious HTML code.
// Used for cases that attackers would try to insert
// some malicious HTML with JS code attached to it, to make damage.
// To avoid this, xss() is converting these HTML symbols.
app.use(xss());

// Express Security - Prevent Parameter Pollution
// In case of duplicate fields in the query, hpp clears up the query string.
// Preventing from attackers to take advantage of this case.
// whitelist - An array of properties for which we actually allow to duplicate in the query string.
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsAverage',
        'ratingsQuantity',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// Manipulates the request object, add the current time to the request.
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // Logs cookie.
    //console.log(req.cookies);
    next();
});

// Route Mounting
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewRouter);
app.use('/api/v1/bookings', bookingRouter);

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