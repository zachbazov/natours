const mongoose = require('mongoose');
const slugify = require('slugify');

const User = require('../model/user-model');

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
    },
    // Geospatial Data - GeoJSON
    // In order to specify geospatial data with mongodb, we need to create a new object,
    // that object needs to have at least two field names. e.g. type & coordinates.
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        // FIXME: cords[lng,lat] !!! 
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    // Modeling Tour Guides - Embedding.
    guides: Array
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

// Modeling Tour Guides - Embedding / Denormalized.
tourSchema.pre('save', async function(next) {
    // this.guides - An array of all the relevant tour-guide role user IDs.
    const guidesPromises = this.guides.map(async id => await User.findById(id));
    // Promise.all() - The result of looping in this.guides will return a promise for each looped object.
    // guidesPromises - An array of promises, based on this.guides.
    // Finally, awaits the result for all promises.
    this.guides = await Promise.all(guidesPromises);
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
