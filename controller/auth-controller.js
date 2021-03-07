const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/user-model');
const catchAsync = require('../utils/catch-async');
const AppError = require('../utils/app-error');
const Messenger = require('../utils/messenger');

const signToken = id => {
    return jwt.sign(
        { id: id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Authentication JWT Cookie
    // A browser automatically stores a cookie that it recieves,
    // and sends it back along with all future requests to the same server.

    // Cookie options object.
    const mOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // Recieves the cookie, stores and sends it along with every request.
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') mOptions.secure = true;

    res.cookie('jwt', token, mOptions);

    // Removes the password from the signup output.
    user.password = undefined;
  
    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
}

exports.signUp = catchAsync(async (req, res, next) => {
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
    createSendToken(newUser, 201, res);
});

exports.signIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) return next(new AppError('Please type an email and password.', 400));
    
    const user = await User.findOne({ email }).select('+password');
    console.log(user)
    if (!user || !(await user.isPasswordCorrect(password, user.password)))
        return next(new AppError('Invalid credentials.', 401)) // 401 - Unauthorised.

    createSendToken(user, 200, res);
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

// User Roles/Permissions
// Unauthorised users won't be able to access certain routes.
// 403 - forbidden.
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        console.log(roles, req.user.role, req.user);
        if (!roles.includes(req.user.role))
            return next(new AppError('You do not have permission to perform this action.', 403));
        next();
    }
}

// Reset Password Functionallity
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // Get user based on POSTed email.
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError('User does not exists.'), 404) // 404 - not found.
    // Generate the random token.
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // Send it back to user's email.
    const resetUrl = 
        `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`
    const message = 
        `Forgot your password?
        Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}
        \nTake note that this token is valid just for 10 minutes period.
        \nIf you didn't forget your password, please ignore this message.`

    try {
        await Messenger({
            email: user.email,
            subject: 'Your password reset token.',
            message
        });
        res.status(200).json({
            status: 'success',
            message: 'Token has been sent to email.'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email, try again later.', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // Get user based on the token.
    // req.params.token - token specified on user routes as a parameter.
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    // Set the new password, only if token has not expired, and there is a user.
    if (!user) return next(new AppError('Token is invalid or has expired.', 400)); // 400 - bad request.
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // Update changedPasswordAt property for the user.
    
    // Log the user in, send JWT.
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.isPasswordCorrect(req.body.passwordCurrent, user.password)))
        return next(new AppError('Your current password is wrong.', 401));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({
        status: 'success',
        token
    });
});
