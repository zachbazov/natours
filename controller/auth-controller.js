const jwt = require('jsonwebtoken');
const User = require('../model/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

exports.signup = catchAsync(async (req, res, next) => {
    // Instead of using .create(req.body), which is a serious security flow.
    // We'll pass in the necessary data only.
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    // Remember: In MongoDB, an id argument specified as _id.
    // In .sign(payload, jwt-secret),
    // the payload is actually an object for all the data that we want to store inside of the token.
    // That payload object will be put into the jwt token.
    //jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: { user: newUser }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) return next(new AppError('Please type an email and password.', 400));
    
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.isCorrectPassword(password, user.password)))
        return next(new AppError('Invalid credentials.', 401)) // 401 - Unauthorised.

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
});