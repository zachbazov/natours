const express = require('express');
const reviewController = require('../controller/review-controller');
const authController = require('../controller/auth-controller');

const router = express.Router();

router
    .route('/')
    .get(authController.protect, reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview);

module.exports = router;