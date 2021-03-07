const mongoose = require('mongoose');
const Tour = require('./tour-model');

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

// Indexes
// Review creation - Each combination of tour and user has always to be unique.
reviewSchema.index({ tour: 1, user: 1}, { unique: true });

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

// Average - Rating Calculation.
// Static method - We needed to call the aggregate function on the model.
// So in a static method to this variable calls exactly to a method,
// so it's very handy in these cases.

// Creates the statistics of the average and number of ratings for the tour ID,
// for which the current review was created.
reviewSchema.statics.calculateAverageRatings = async function(tour) {
    // this - Points to the current model.
    const stats = await this.aggregate([
        // Aggregation pipeline stages:
        // $match - Select all the reviews that actually belong to the current tour
        // that was passed in as the argument.
        { $match: { tour: tour._id } },
        {
            // $group - The first field that we need to specify is the ID, so _id
            // and then the common field that all of the documents have in common
            // that we want to group by.
            $group: {
                _id: '$tour',
                // Add 1 for each tour that we have, each tour that was matched.
                // e.g. 5 reviews = reviews[0]-[4], nRating = 5.
                nRating: { $sum: 1 },
                // Average ratings, by User.rating.
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    // Updates the statistics to the current tour.
    if (stats.length > 0)
        await Tour.findByIdAndUpdate(tour._id, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    else
        await Tour.findByIdAndUpdate(tour._id, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    //console.log(stats);
}

// Calculates average ratings as soon as a new review has been created.
reviewSchema.post('save', function () {
    // this - Points to current review.
    // contructor - The model who created that document.
    this.constructor.calculateAverageRatings(this.tour);
});

// Retrieves the review document from this variable.
// In a query midddleware, we only have access to the query.
// An hack for this, is getting access to the current document by find it.
reviewSchema.pre(/^findOneAnd/, async function(next) {
    // this - Points to the current query.
    // Passing data from the pre-middleware to the post middleware.
    // And so instead of saving this document to a simple variable,
    // we're gonna save it to this.mReview.
    this.mReview = await this.findOne();
    next();
});

// So after the query has already finished,
// and so therefore the review has been updated,
// this is a perfect point to calculate average ratings.
reviewSchema.post(/^findOneAnd/, async function() {
    // this.mReview - The object passed from the pre middleware.
    // In case of a static method, we need to call it on the model this.mReview.
    await this.mReview.constructor.calculateAverageRatings(this.mReview.tour);

    // ** DOES'NT work, query has already been executed. **
    // this.mReview = await this.findOne();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;