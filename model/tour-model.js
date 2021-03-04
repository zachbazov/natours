const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name.'],
        unique: true,
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
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price.'],
    },
    priceDiscount: Number,
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
        //select: false,
    },
    startDates: [Date],
    slug: String
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

tourSchema.post('save', function(doc, next) {
    console.log(doc);
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
