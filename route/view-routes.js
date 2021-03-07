const express = require('express');

const viewController = require('../controller/view-controller');

const router = express.Router();

router.get('/', viewController.getOverview);

router.get('/tour', viewController.getTour);

module.exports = router;