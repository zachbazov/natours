const catchAsync = require('../utils/catch-async');
const Tour = require('../model/tour-model');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});


exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker'
    });
};