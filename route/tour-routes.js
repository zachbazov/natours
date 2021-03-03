const express = require('express');
const app = require('../app');

const tourController = require('./../controller/tour-controller');

const router = express.Router();

// Param middleware
router.param('id', tourController.checkID);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        tourController.checkBody,
        tourController.createTour
    );

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;
