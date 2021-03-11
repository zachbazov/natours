const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const Tour = require('../model/tour-model');
const User = require('../model/user-model');
const Booking = require('../model/booking-model');

exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    // data-alert property at base template.
    if (alert === 'booking')
        res.locals.alert = 'Your booking has been registered.\nPlease check your email for a confirmation.\nIt takes up to a few minutes for your booking to be updated at our end.'
    next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        select: 'review rating user'
    });
    if (!tour) return next(new AppError('No tour found.', 400));
    res.status(200).render('tour', {
        title: tour.name,
        tour
    });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
    // Finds all bookings for the current user.
    const bookings = await Booking.find({ user: req.user.id });
    // Finds users with the returned IDs.
    const tourIds = bookings.map(el => el.tour);
    // Selects all the tours which have an id that in the userIds array.
    const tours = await Tour.find({ _id: { $in: tourIds } });
    res.status(200).render('overview', {
        title: 'My Bookings',
        tours
    });
});

exports.getSignForm = (req, res) => {
    res.status(200).render('sign-in', {
        title: 'Sign In'
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'My Account'
    });
};

exports.getSignUpForm = (req, res) => {
    res.status(200).render('sign-up', {
        title: 'Sign Up'
    });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200).render('account', {
        title: 'My Account',
        user: updatedUser
    });
});