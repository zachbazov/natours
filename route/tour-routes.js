const express = require('express');

const tourController = require('../controller/tour-controller');
const authController = require('../controller/auth-controller');
const reviewRouter = require('../route/review-routes');

const router = express.Router();

// Merge Params.
// /:id - A parameter that we'll granting access to the specified router.
router.use('/:id/reviews', reviewRouter);

router
    .route('/top-five-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

router
    .route('/tour-stats').get(tourController.getTourStats);

router
    .route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);

// Removed - Refactored due to a Merge Param setup.
// Nested Routes.
// Mounting user's reviews to tours based on tour ID.
// router
//     .route('/:id/reviews')
//     .post(
//         authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview);

module.exports = router;
