const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const APIFeatures = require('../utils/api-features');

exports.getAll = Model => catchAsync(async (req, res, next) => {
    // Review usage - Allowing nested GET reviews on a tour.
    // If there is a tour ID, only the reviews where the tour
    // matches the ID are going to be found.
    // FIXME: Next 2 lines should be on a separate fn.
    let filter;
    if (req.params.id) filter = { tour: req.params.id };

    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // Query Statistics.
    //const documents = await features.query.explain();
    const documents = await features.query;

    res.status(200).json({
        status: 'success',
        results: documents.length,
        data: documents
    });
});

exports.getOne = (Model, populateOpts) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOpts) query = query.populate(populateOpts);

    const document = await query;

    if (!document) return next(new AppError('No documents found.', 404));
    
    res.status(200).json({
        status: 'success',
        data: document
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: { data: document }
    });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!document) return next(new AppError('No documents found.', 404));

    res.status(200).json({
        status: 'success',
        data: { data: document }
    });
});

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) return next(new AppError('No documents found.', 404));

    res.status(204).json({
        status: 'success',
        data: null
    });
});