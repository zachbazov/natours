const Tour = require('../model/tour-model');
const APIFeatures = require('../utils/api-features');

exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields =
        'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = async (req, res) => {
    try {
        // const queryObj = { ...req.query };
        // const excludedFields = [
        //     'page',
        //     'sort',
        //     'limit',
        //     'fields',
        // ];
        // excludedFields.forEach(
        //     (field) => delete queryObj[field]
        // );
        // //console.log(req.query);
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(
        //     /\b(gte|gt|lte|lt)\b/g,
        //     (match) => `$${match}`
        // );
        //console.log(JSON.parse(queryStr));

        // let query = Tour.find(JSON.parse(queryStr));

        // if (req.query.sort) {
        //     const sortBy = req.query.sort
        //         .split(',')
        //         .join(' ');
        //     console.log(sortBy);
        //     query = query.sort(sortBy);
        // } else query = query.sort('-createdAt');

        // if (req.query.fields) {
        //     const fields = req.query.fields
        //         .split(',')
        //         .join(' ');
        //     query = query.select(fields);
        // } else query = query.select('-__v');

        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit;

        // query = query.skip(skip).limit(limit);

        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if (skip > numTours)
        //         throw new Error(
        //             'This page does not exist.'
        //         );
        // }

        const features = new APIFeatures(
            Tour.find(),
            req.query
        )
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const tours = await features.query;

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: tours,
        });
    } catch (err) {
        res.status(400).json({
            status: 'failure',
            message: err.message,
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        // Tour.findOne({ _id: req.params.id })
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: tour,
        });
    } catch (err) {
        res.status(400).json({
            status: 'failure',
            message: err.message,
        });
    }
};

exports.createTour = async (req, res) => {
    try {
        // const newTour = new Tour({});
        // newTour.save();
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'failure',
            message: err.message,
        });
    }
};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'failure',
            message: err.message,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(400).json({
            status: 'failure',
            message: err.message,
        });
    }
};
