const User = require('../model/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

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

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find().select('-__v');

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: users
    });
});

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    });
};

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    });
};

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    });
};

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined'
    });
};

exports.updatePersonalInfo = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
        return next(
            new AppError('This route is not for password update, please use /update-password.', 400));
            
    const filteredBody = filterObject(req.body, 'name', 'email');
    // new - returns the new object, the updated object, instead of the old object.
    // filteredBody - filtered out unwanted field name that are not specified to be updated.
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        user: updatedUser
    });
});