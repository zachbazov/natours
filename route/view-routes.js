const express = require('express');

const viewController = require('../controller/view-controller');
const authController = require('../controller/auth-controller');

const router = express.Router();

router.get('/', authController.isSignedIn, viewController.getOverview);

router.get('/tours/:slug', authController.isSignedIn, authController.protect, viewController.getTour);

router.get('/sign-in', authController.isSignedIn, viewController.getSignForm);

router.get('/account', authController.protect, viewController.getAccount);

module.exports = router;