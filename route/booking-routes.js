const express = require('express');
const bookingController = require('../controller/booking-controller');
const authController = require('../controller/auth-controller');

const router = express.Router();

router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);

module.exports = router;