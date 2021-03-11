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

// Authentication JWT Cookie
// A browser automatically stores a cookie that it recieves,
// and sends it back along with all future requests to the same server.
const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // httpOnly - Cookie cannot be manipulated or destroyed.
        // Recieves the cookie, stores and sends it along with every request.
        httpOnly: true,
        // Heroku specifics.
        // Tests if the connection is secure, JUST with a deployed heroku app!!!
        // req.headers... - used for proxy.
        secure: req.secure || req.headers('x-forwarded-proto') === 'https'
    });

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
    // const newUser = await User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfirm: req.body.passwordConfirm
    // });
    const { name, email, password, passwordConfirm } = req.body;
    console.log('AUTHC', name, email, password, passwordConfirm);
    const newUser = await User.create({ name, email, password, passwordConfirm });
    res.status(200).json({ status: 'success', data: {newUser} });
    // Advanced Emails.
    //const url = `${req.protocol}://${req.get('host')}/sign-in`;
    //await new Messenger(newUser, url).sendWelcome();

    // Remember: In MongoDB, an id argument specified as _id.
    // In .sign(payload, jwt-secret),
    // the payload is actually an object for all the data that we want to store inside of the token.
    // That payload object will be put into the jwt token.
    //jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    //createSendToken(newUser, 201, req, res);
});

exports.signIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) return next(new AppError('Please type an email and password.', 400));
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.isPasswordCorrect(password, user.password)))
        return next(new AppError('Invalid credentials.', 401)) // 401 - Unauthorised.

    createSendToken(user, 200, req, res);
});

exports.signOut = (req, res) => {
    res.cookie('jwt', 'signed-out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};

// Route Protection
// Checks if the user is logged in.
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1]; // second element.
    else if (req.cookies.jwt) // Cookies - authenticate users based on token.
        token = req.cookies.jwt;
    
    if (!token) return next(new AppError('You are not logged in, login to gain access.', 401));

    // Verification by payload, checks if the token has been manipulated by malicious third-party.
    // util - promisify, will return a promise, so we can await it and store it.

    // ** Signing out means that the verification should fail, but won't return an error,
    // instead, it skips for the next middleware **
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
    // Makes variables accessible in our template files.
    res.locals.user = user;
    // Grant access to next route.
    next();
});

// ** Removed - catchAsync due to signing out jwt malformed error.
// Similarly to protect() middleware, we simply check for authenticate user by cookies.
// only for rendered pages, no errors.
exports.isSignedIn = async (req, res, next) => {
     // Cookies - authenticate users based on token.
    if (req.cookies.jwt) {
        try {
            // Verification by payload, checks if the token has been manipulated by malicious third-party.
            // util - promisify, will return a promise, so we can await it and store it.
            const decoded = await promisify(jwt.verify) (req.cookies.jwt, process.env.JWT_SECRET); // recieves a callback.
            
            // Finds the user by the id given id the decoded object.
            // Makes sure the id is absolutely correct.
            const user = await User.findById(decoded.id);

            // Checks if the user exists, to make sure that the token is valid even if the user has deleted.
            if (!user) return next();

            // Checks if the user has recently changed his password.
            // iat - issued at.
            if (user.isPasswordChangedAfter(decoded.iat)) return next();

            // This stage means for an existing user token.
            // Makes user accessible.
            res.locals.user = user;
            // Grant access to next route.
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

// User Roles/Permissions
// Unauthorised users won't be able to access certain routes.
// 403 - forbidden.
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
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

    try {
        const resetUrl = 
            `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`
        // await Messenger({
        //     email: user.email,
        //     subject: 'Your password reset token.',
        //     message
        // });
        // Advanced Emails.
        await new Messenger(user, resetUrl).sendPasswordReset();

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
    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.isPasswordCorrect(req.body.passwordCurrent, user.password)))
        return next(new AppError('Your current password is wrong.', 401));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, req, res);
});
