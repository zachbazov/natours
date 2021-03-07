const Tour = require('../model/tour-model');
const catchAsync = require('../utils/catch-async');
const controller = require('./generic-controller');

exports.getAllTours = controller.getAll(Tour);

exports.getTour = controller.getOne(Tour, { path: 'reviews' });

exports.createTour = controller.createOne(Tour);

exports.updateTour = controller.updateOne(Tour);

exports.deleteTour = controller.deleteOne(Tour);

exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

// Aggregation Pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        { $match: { ratingsAverage: { $gte: 4.5 } } },
        { $group: {
                //_id: '$difficulty',
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        },
        { $sort: { avgPrice: 1 } }, // 1 for ascending order.
        //{ $match: { _id: { $ne: 'EASY' } } }
    ]);

    res.status(200).json({
        status: 'success',
        data: { stats }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        { $unwind: '$startDates' },
        { $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        { $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        { $addFields: { month: '$_id' } },
        { $project: { _id: 0 } }, // 0 - wont be projected.
        { $sort: { numTourStarts: -1 } },
        //{ $limit: 6 }
    ]);

    res.status(200).json({
        status: 'success',
        data: { plan }
    });
});

// Removed - Implemented a generic controller.

// exports.getTour = catchAsync(async (req, res, next) => {
//     // .populate('reviews') - In this case, implemented for a virtual populate.
//     const tour = await Tour.findById(req.params.id).populate('reviews');

//     // Must have a return statement, to proceed to the next middleware.
//     if (!tour) return next(new AppError('Invalid ID', 404));
    
//     res.status(200).json({
//         status: 'success',
//         data: tour
//     });
// });

// exports.createTour = catchAsync(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status: 'success',
//         data: { tour: newTour }
//     });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     });
//     if (!tour) return next(new AppError('Invalid ID', 404));
//     res.status(200).json({
//         status: 'success',
//         data: { tour }
//     });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
    //     const tour = await Tour.findByIdAndDelete(req.params.id);
    //     if (!tour) return next(new AppError('Invalid ID', 404));
    //     res.status(204).json({
        //         status: 'success',
        //         data: null
        //     });
        // });