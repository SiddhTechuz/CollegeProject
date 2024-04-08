//review rating created refernce to tour & user
const mongoose = require('mongoose');
const User = require('./userModel');
const Tour = require('./tourModel')
const reviewSchema = new mongoose.Schema({

    review: {
        type: String,
        required: [true, 'Review cannot be empty']
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
        required: [true, 'review must belong to tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A review must belong to a user']
    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
        // timestamps: true
    })

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        })
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }

    //in static method this poibts to model and we neeed to aggreagate always on the mdel
}
reviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.tour);
    //post middleware does not have next()
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    next();
})
reviewSchema.post(/^findOneAnd/, async function () {
    // this.r = await this.findOne(); does not work here query has already been executed
    await this.r.constructor.calcAverageRatings(this.r.tour)
})
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // })
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})
const Review = mongoose.model('Review', reviewSchema)
module.exports = Review;