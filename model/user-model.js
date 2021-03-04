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
        minlength: [8, 'Password must be at least 8 characters']
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A reconfirmation of your password is required.'],
        // This validator will only work on .save(), .create().
        validate: {
            validator: function(el) { return el === this.password; },
            message: 'Passwords do not match.'
        }
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
    this.password = await bcrypt.hash(this.password, 12);
    // No longer need to persist this field.
    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;