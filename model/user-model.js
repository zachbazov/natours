const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'tour-guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    name: {
        type: String,
        required: [true, 'A name is required.']
    },
    email: {
        type: String,
        required: [true, 'A email is required.'],
         // unique identifier for each user.
        unique: true,
        lowercase: true,
        // validator
        validate: [validator.isEmail, 'A email must be valid.']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'A password is required.'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A reconfirmation of your password is required.'],
        // This validator will only work on .save(), .create().
        validate: {
            validator: function(el) { return el === this.password; },
            message: 'Passwords do not match.'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// Password Encryption
userSchema.pre('save', async function(next) {
    // Runs only if password was modified.
    if (!this.isModified('password')) return next();
    // Password Hashing
    // We want to set our current password, basically to the encrypted version of the original password,
    // with the cost of 12, not to make it too easy to brake the password,
    // but also not to make the application to take too long before encrypting the password.
    this.password = await bcrypt.hash(this.password, 10);
    // No longer need to persist this field.
    this.passwordConfirm = undefined;
    next();
});

// Reset Functionallity
userSchema.pre('save', function (next) {
    // If we didn't modified the password,
    // then we do not want to manipulate passwordChangedAt.
    if (!this.isModified('password') || this.isNew) return next();
    // Puting this value with one second in the past,
    // will ensure that the token is always created after the password has been changed.
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Authentication De-Activation - Delete.
// In case we want to delete user, we should deactivate the user instead of delete from data.
// Query middleware for any query that contains find in its path.
// Applys an active flag for the user, those with false will not be projected.
userSchema.pre(/^find/, function(next) {
    this.find({ active: true });
    next();
});

// Encrypted Password Comparison.
// candidatePassword - isn't hashed, it's actually the original password.
// bcrypt will encrypt it and then compare both values.
userSchema.methods.isPasswordCorrect = async function(candidatePassword, password) {
    return await bcrypt.compare(candidatePassword, password);
};

// JWT Authentication Verification
// Checks if the user has changed his password after the token was issued.
// JWTTimestamp - the timestamp when the token was issued.
userSchema.methods.isPasswordChangedAfter = function(JWTTimestamp) {
    // If there is not passwordChangedAt, means that the user hasn't changed his password.
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    // User hasn't changed his password after token issued.
    return false;
}

// Reset Functionallity
userSchema.methods.createPasswordResetToken = function() {
    // This token is what we gonna send to the user.
    // It's a reset password that the user can use to create a new real password.
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes - 60 seconds - 1sec = 10mins.
    console.log({resetToken}, this.passwordResetToken);
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;