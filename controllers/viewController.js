const Tours = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');
// const Tour = require('../models/tourModel');

exports.getOverview = catchAsync(async (req, res, next) => {
    //1) getr tour data collection
    const tours = await Tours.find();
    //2) Build template


    //3) render data using tour data from step 1
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});
exports.getTour = catchAsync(async (req, res, next) => {
    //1)get the data,for the requested tour (including reviews and guides)

    const tour = await Tours.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    //2) Build template
    if (!tour) {
        return next(new AppError('There is no tour with that name'), 404)
    }
    //3 render template
    res.status(200)
        .render('tour', {
            title: `${tour.name} Tour`,
            tour
        });
})
exports.login = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'Log In to your Account'
    })
})
exports.signup = catchAsync(async (req, res, next) => {
    res.status(200).render('signup', {
        title: 'Create your Account'
    })
})
exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your Account'
    })
}
exports.getMyTours = catchAsync(async (req, res, next) => {
    //1 find all bookings
    const bookings = await Booking.find({ user: req.user.id })

    //2 find tours with the returned ids 
    const tourIds = bookings.map(el => el.tour);
    const tours = await Tours.find({ _id: { $in: tourIds } })

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    })
})

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    });
});