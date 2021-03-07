const express = require('express');

const tourController = require('../controller/tour-controller');
const authController = require('../controller/auth-controller');
const reviewController = require('../controller/review-controller');

const router = express.Router();

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

// Nested Routes.
// Mounting user's reviews to tours based on tour ID.
router
    .route('/:id/reviews')
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview);

module.exports = router;
