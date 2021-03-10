const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const controller = require('../controller/generic-controller');
const Tour = require('../model/tour-model');
const Booking = require('../model/booking-model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //Gets the currently booked tour.
    const tour = await Tour.findById(req.params.tourId);
    if (!tour) return next(new AppError('No tour found for checkout session.', 400));
    // Creates a checkout session.
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
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
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // ** TEMPORARY SOLUTION ** Unsecure!
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price });
    // redirect - Creates yet another request to our route url, re-hits '/' route in this case.
    res.redirect(req.originalUrl.split('?')[0]);
    /*
    So for the second time we're going to be hitting that
    but now the tour, user, and price are no longer defined.
    And so then we will go to the next middleware,
    which finally is the get overview handler function,
    which then we'll just render the homepage.
    */
});

exports.getBooking = controller.getOne(Booking);
exports.getAllBookings = controller.getAll(Booking);
exports.createBooking = controller.createOne(Booking);
exports.updateBooking = controller.updateOne(Booking);
exports.deleteBooking = controller.deleteOne(Booking);