const mongoose = require('mongoose');
const validator = require('validator');

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

const User = mongoose.model('User', userSchema);

module.exports = User;