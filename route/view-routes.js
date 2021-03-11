const express = require('express');

const viewController = require('../controller/view-controller');
const authController = require('../controller/auth-controller');
const bookingController = require('../controller/booking-controller');

const router = express.Router();

router.use(viewController.alerts);

router.get('/', authController.isSignedIn, viewController.getOverview);

router.get('/tours/:slug', authController.isSignedIn, viewController.getTour);

router.get('/sign-in', authController.isSignedIn, viewController.getSignForm);

router.get('/account', authController.protect, viewController.getAccount);

router.get('/my-bookings', authController.protect, viewController.getMyBookings);

router.get('/sign-up', viewController.getSignUpForm);

// Removed - Used for submitting forms via URL encoded.
//router.post('/submit-user-data', authController.protect, viewController.updateUserData);

module.exports = router;