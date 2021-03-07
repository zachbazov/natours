const Review = require('../model/review-model');
const controller = require('./generic-controller');

exports.getAllReviews = controller.getAll(Review);

exports.getReview = controller.getOne(Review);

exports.createReview = controller.createOne(Review);

exports.updateReview = controller.updateOne(Review);

exports.deleteReview = controller.deleteOne(Review);

// Assigns the relevant tour and user data for a specific review.
exports.assignRelationalData = (req, res, next) => {
    // Nested Routes.
    // If we didn't specify the tour ID and the body,
    // then we want to define that as the one coming from the URL.
    if (!req.body.tour) req.body.tour = req.params.id;
    // If there user in the request, we define it by .protect() auth's middleware.
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

// Removed - Implemented a generic controller.

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//     // If there is a tour ID, only the reviews where the tour
//     // matches the ID are going to be found.
//     let filter;
//     if (req.params.id) filter = { tour: req.params.id };
//     const reviews = await Review.find(filter);
//     res.status(200).json({
//         status: 'success',
//         results: reviews.length,
//         data: { reviews }
//     });
// });

// exports.createReview = catchAsync(async (req, res, next) => {
//     // Nested Routes.
//     // If we didn't specify the tour ID and the body,
//     // then we want to define that as the one coming from the URL.
//     if (!req.body.tour) req.body.tour = req.params.id;
//     // If there user in the request, we define it by .protect() auth's middleware.
//     if (!req.body.user) req.body.user = req.user.id;
    
//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: { review: newReview }
//     });
// });