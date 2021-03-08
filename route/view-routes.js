const express = require('express');

const viewController = require('../controller/view-controller');
const authController = require('../controller/auth-controller');

const router = express.Router();

router.use(authController.isSignedIn);

router.get('/', viewController.getOverview);

router.get('/tours/:slug', authController.protect, viewController.getTour);

router.get('/sign-in', viewController.getSignForm);

module.exports = router;