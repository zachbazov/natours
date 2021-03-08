const express = require('express');

const viewController = require('../controller/view-controller');

const router = express.Router();

router.get('/', viewController.getOverview);

router.get('/tours/:slug', viewController.getTour);

module.exports = router;