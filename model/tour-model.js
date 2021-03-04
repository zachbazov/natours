const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name.'],
        unique: true,
        trim: true,
        maxlength: [32, 'A tour name cannot exceeds 32 characters.'],
        minlength: [10, 'A tour name needs to exceed 10 characters.'],
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration.'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size.'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty.'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or difficult.'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0.'],
        max: [5, 'Rating must be below 5.0.']
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price.'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                // this only points to current doc on new document creation, but not update.
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below the regular price.'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description.'],
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image.'],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    startDates: [Date],
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual Properties
// Wont be persisted in the data, it's gonna be presented as soon as we get the data.
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

// Document Middlewares
// runs before .save() and .create(), have access to the document being saved.
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lowercase: true });
    next();
});

// Query Middlewares
// RegEx - all the strings that starts with 'find'.
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
    // Used for measuring the execution time.
    this.start = Date.now();
    next();
});

// Measures the execution time of a query.
tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query executed in ${Date.now() - this.start} ms.`);
    next();
});

// Aggregation Middlewares
tourSchema.pre('aggregate', function(next) {
    // this points to the current aggregation.
    // Removing from the output all the tours with the secret parameter set to false.
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
