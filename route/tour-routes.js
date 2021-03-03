const express = require('express');

const tourController = require('../controller/tour-controller');

const router = express.Router();

// Param middleware
//router.param('id', tourController.checkID);

router
    .route('/top-five-cheap')
    .get(
        tourController.aliasTopTours,
        tourController.getAllTours
    );

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;
