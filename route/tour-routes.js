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
    .route('/monthly-plan/:year').get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan);

// Geospatial Data.
router
    .route('/tours-within/:distance/center/:lnglat/unit/:unit')
    .get(tourController.getToursWithin);

// router
//     .route('/distances/:latlng/unit/:unit')
//     .get(tourController.getDistances);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour)
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
