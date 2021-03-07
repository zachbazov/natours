const mongoose = require('mongoose');
const slugify = require('slugify');

// Removed - Child Referncing
// Referring to the user inside the model.
//const User = require('./user-model');

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
        max: [5, 'Rating must be below 5.0.'],
        // set - Setter function that will run anytime there is a change is his parent value.
        set: val => Math.round(val * 10) / 10 // 4.666666 -> 4.6666 -> 47 -> 4.7
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
        coordinates: [Number]
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
    // Modeling Tour Guides.
    // Embedding / Denormalized.
    //guides: Array

    // Referencing / Normalized.
    // the idea is that tours and users will always remain,
    // completely separate entities in our database.
    // So all we save on a certain tour document
    // is the IDs of the users that are the tour guides
    // for that specific tour.
    // Then when we query the tour,
    // we want to automatically get access to the tour guides.
    // without them being actually saved on the tour document itself.
    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes - Performance Gain.
// An ordered list of all the IDs, for example,
// that gets stored outside of the collection.
// Whenever documents are queried by the ID MongoDB will search
// that ordered index instead of searching through the whole collection,
// and look at all the documents one by one.
// 1 / -1 - Ascending/Descending order.
//tourSchema.index({ price: 1 });
// Queries for a tour by a slug.
tourSchema.index({ slug: 1 });

// Geospatial Data.
// So for geospatial data, this index needs to be a 2D sphere index
// if the data describes real points on the Earth like sphere.
//tourSchema.index({ startLocation: '2dsphere' });

// Compound Index
tourSchema.index({ price: 1, ratingsAverage: -1 });

// Virtual Properties.
// Wont be persisted in the data, it's gonna be presented as soon as we get the data.
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

// Virtual Populate.
tourSchema.virtual('reviews', {
    ref: 'Review',
    // foreignField - This is the name of the field in the other model.
    // So in the Review model in this case,
    // where the reference to the current model is stored.
    foreignField: 'tour',
    // localField - The ID is actually stored here in this current Tour model.
    localField: '_id'
});

// Document Middlewares.
// Runs before .save() and .create(), have access to the document being saved.
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lowercase: true });
    next();
});

// Modeling Tour Guides - Embedding / Denormalized.
// this.guides - An array of all the relevant tour-guide role user IDs.
// Promise.all() - The result of looping in this.guides will return a promise for each looped object.
// guidesPromises - An array of promises, based on this.guides.
// Finally, awaits the result for all promises.
// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(id => User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// ** May conflict with Geospatial Aggregation, $match is first. **
// Aggregation Middlewares
// tourSchema.pre('aggregate', function(next) {
//     // this points to the current aggregation.
//     // Removing from the output all the tours with the secret parameter set to false.
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     console.log(this.pipeline());
//     next();
// });

// Populating - Modeling Tour Guides.
// Get access to the referenced tour guides whenever we query for a certain tour.
// The result of that would look like the data was always been embedded,
// as in fact we know it's on a completely different collection.
// NOTE: In query middleware, this always points to the current query.
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
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

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;