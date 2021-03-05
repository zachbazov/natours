const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    passwordChangedAt: Date
});

// Password Encryption
userSchema.pre('save', async function(next) {
    // Runs only if password was modified.
    if (!this.isModified('password')) return next();
    // Password Hashing
    // We want to set our current password, basically to the encrypted version of the original password,
    // with the cost of 12, not to make it too easy to brake the password,
    // but also not to make the application to take too long before encrypting the password.
    this.password = await bcrypt.hash(this.password, 12);
    // No longer need to persist this field.
    this.passwordConfirm = undefined;
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

const User = mongoose.model('User', userSchema);

module.exports = User;