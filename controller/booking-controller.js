const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const controller = require('../controller/generic-controller');
const Tour = require('../model/tour-model');
const User = require('../model/user-model');
const Booking = require('../model/booking-model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //Gets the currently booked tour.
    const tour = await Tour.findById(req.params.tourId);
    console.log(req.params.tourId);
    if (!tour) return next(new AppError('No tour found for checkout session.', 400));
    // Creates a checkout session.
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        //success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get('host')}/my-bookings`,
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
    console.log(session);
    // Creates a session as response.
    res.status(200).json({
        status: 'success',
        session
    });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     // ** TEMPORARY SOLUTION ** Unsecure!
//     const { tour, user, price } = req.query;
//     if (!tour && !user && !price) return next();
//     await Booking.create({ tour, user, price });
//     // redirect - Creates yet another request to our route url, re-hits '/' route in this case.
//     res.redirect(req.originalUrl.split('?')[0]);
//     /*
//     So for the second time we're going to be hitting that
//     but now the tour, user, and price are no longer defined.
//     And so then we will go to the next middleware,
//     which finally is the get overview handler function,
//     which then we'll just render the homepage.
//     */
// });
// testing
const createBookingCheckout = catchAsync(async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.line_items[0].amount / 100;
    console.log(tour, user, price);
    //await Booking.create({ tour, user, price });
});

// Will run whenever a payment was successful.
// Stripe then will call our webhook, which is the URL,
// will receive a body from the request object,
// and together with the signature, and/or our webhook secret,
// creates an event, which will contain the session.
// Using that session data, we can create our new booking in the database.
exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        console.log(event);
    } catch (err) {
        console.log(err);
        return res.status(400).send(`[ERROR] Webhook error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed')
        createBookingCheckout(event.data.object);
    //res.status(200).json({ received: true });
};

exports.getBooking = controller.getOne(Booking);
exports.getAllBookings = controller.getAll(Booking);
exports.createBooking = controller.createOne(Booking);
exports.updateBooking = controller.updateOne(Booking);
exports.deleteBooking = controller.deleteOne(Booking);