const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const controller = require('./generic-controller');
const Tour = require('../model/tour-model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const CSP_PERMISSIONS = `default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;`;

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // Gets the currently booked tour.
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) return next(new AppError('No tour found for checkout session.', 400));
    // Creates a checkout session.
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/`,
        cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [{
            name: `${tour.name} Tour`,
            description: `${tour.summary}`,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1
        }]
    });
    // Creates a session as response.
    res.status(200).set('Content-Security-Policy', CSP_PERMISSIONS).json({
        status: 'success',
        session
    });
});