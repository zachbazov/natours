const User = require('../model/user-model');
const catchAsync = require('../utils/catch-async');

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
