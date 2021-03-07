const Review = require('../model/review-model');
const catchAsync = require('../utils/catch-async');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { reviews }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    // Nested Routes.
    // If we didn't specify the tour ID and the body,
    // then we want to define that as the one coming from the URL.
    if (!req.body.tour) req.body.tour = req.params.id;
    // If there user in the request, we define it by .protect() auth's middleware.
    if (!req.body.user) req.body.user = req.user.id;
    
    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { review: newReview }
    });
});