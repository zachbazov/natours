const express = require('express');
const reviewController = require('../controller/review-controller');
const authController = require('../controller/auth-controller');

// Merge Params.
// In order to get access to that parameter defined in the URL, e.g. '/:id/',
// in this other router, we need to physically merge the parameters.
const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(authController.protect, reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.assignRelationalData,
        reviewController.createReview);

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview);

module.exports = router;