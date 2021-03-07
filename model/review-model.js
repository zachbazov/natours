const mongoose = require('mongoose');

// Parent Referencing - Modeling Tour/User Reviews.
const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review cannot be empty.']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must belong to a user.']
    }
},{
    // Makes sure that when we have a virtual property,
    // basically a field that is not stored in the database
    // but calculated using some other value.
    // So we want this to also show up whenever there is an output.
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Parent Referencing - Populating Reviews.
// Chainned populating for accessing both user and tour data.
reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name -guides'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // });
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;