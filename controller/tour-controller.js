const Tour = require('../model/tour-model');
const catchAsync = require('../utils/catch-async');
const controller = require('./generic-controller');
const AppError = require('../utils/app-error');

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

// Geospatial Data.
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, lnglat, unit } = req.params;
    const [lat, lng] = lnglat.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lng || !lat) return next(new AppError('Format of latitude,longitude is required.', 400));  
    // startLocation - Holds the geospatial data of a certain geometry.
    // $geoWithin - Finds documents within a certain geometry, creates a sphere of
    // the specified location within a specified radius.
    // $centerSphere - Takes in an array of the coordinates and of the radius.
    // radius - The distance that we want to have as the radius, but converted
    // to a special unit called radians.
    // To get the radians, we need to divide our distance by the radius of the earth.
    const tours = await Tour.find(
        { startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } }
    );
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: { data: tours }
    });
});

// Geospatial Aggregation.
exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // miles : kilometers.
    if (!lng || !lat) return next(new AppError('Format of latitude,longitude is required.', 400));
    const distances = await Tour.aggregate([
        {
            // $geoNear - Will automatically use that index in order to perform the calculation.
            // Always needs to be the first stage.
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                // distanceField - name of the field that will be created,
                // and where all the calculated distances will be stored.
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        }, {
            // Gets rid of all the other data except those specified.
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: { data: distances }
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