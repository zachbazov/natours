const User = require('../model/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const controller = require('./generic-controller');

exports.getAllUsers = controller.getAll(User);

exports.getUser = controller.getOne(User);

exports.updateUser = controller.updateOne(User);

exports.deleteUser = controller.deleteOne(User);

exports.deactivate = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getUserProfile = (req, res, next) => {
    // Instead of getting the id from the query parameters,
    // get it from the current user document.
    req.params.id = req.user.id;
    next();
}

// Loop through all the fields that are in the object,
// and then for each field we check if it's one of the allowed fields,
// and if it is, then we create a new field in the new object,
// with the same name, with the exact same value as it has in the original object.
// returns the new object.
const filterObject = (object, ...allowedFields) => {
    const newObject = {};
    Object.keys(object).forEach(el => {
        if (allowedFields.includes(el)) newObject[el] = object[el];
    });
    return newObject;
}

exports.updateUserProfile = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
        return next(
            new AppError('This route is not for password update, please use /update-password.', 400));
            
    // filteredBody - filtered out unwanted field name that are not specified to be updated.
    const filteredBody = filterObject(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        // new - returns the new object, the updated object, instead of the old object.
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        user: updatedUser
    });
});

// Removed - Implemented a generic controller.

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find().select('-__v');

//     res.status(200).json({
//         status: 'success',
//         results: users.length,
//         data: users
//     });
// });