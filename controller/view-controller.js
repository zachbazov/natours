const catchAsync = require('../utils/catch-async');
const Tour = require('../model/tour-model');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});


exports.getTour = catchAsync(async (req, res) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        select: 'review rating user'
    });
    res.status(200).render('tour', {
        title: tour.name,
        tour
    });
});