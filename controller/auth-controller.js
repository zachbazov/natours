const { promisify } = require('util');
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
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
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

    if (!user || !(await user.isPasswordCorrect(password, user.password)))
        return next(new AppError('Invalid credentials.', 401)) // 401 - Unauthorised.

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
});

// Route Protection
// Checks if the user is logged in.
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1]; // second element.
    
    if (!token) return next(new AppError('You are not logged in, login to gain access.', 401));

    // Verification by payload, checks if the token has been manipulated by malicious third-party.
    // util - promisify, will return a promise, so we can await it and store it.
    const decoded = await promisify(jwt.verify) (token, process.env.JWT_SECRET); // recieves a callback.
    
    // Finds the user by the id given id the decoded object.
    // Makes sure the id is absolutely correct.
    const user = await User.findById(decoded.id);

    // Checks if the user exists, to make sure that the token is valid even if the user has deleted.
    if (!user) return next(new AppError('The user belonging to this token no longer exists.', 401));

    // Checks if the user has recently changed his password.
    if (user.isPasswordChangedAfter(decoded.iat)) // iat - issued at.
        return next(new AppError('User recently changed his password, login to gain access.', 401));

    req.user = user;
    // Grant access to next route.
    next();
});
