const Tours = require('../models/tourModel');
const Reviews = require('../models/reviewModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel')
const axios = require('axios')
const Task = require('../models/taskModel')
exports.getOverview = catchAsync(async (req, res, next) => {
    //1) getr tour data collection

    //2) Build template


    //3) render data using tour data from step 1
    res.status(200).render('overview', {
        title: 'Home Page',
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
        title: 'Your ',
        user: updatedUser
    });
});
exports.getMyReviews = catchAsync(async (req, res, next) => {
    const reviews = await Reviews.find({ user: req.user.id })
    const wholeReview = await Promise.all(reviews.map(async review => {
        review.name = (await Tour.findById(review.tour)).name
        return review;
    }))

    res.status(200).render('reviews', {
        title: 'My Reviews',
        wholeReview
    })
})
exports.getUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()
    res.status(200).render('user', {
        title: 'Users',
        users
    })
})
exports.getReviews = catchAsync(async (req, res, next) => {
    // const reviews = await Reviews.find()
    // const wholeReview = await Promise.all(reviews.map(async review => {
    //     review.name = (await Tour.findById(review.tour)).name
    //     return review;
    // }))
    // console.log(wholeReview[0].name);
    // res.status(200).render('review', {
    //     title: 'My Reviews',
    //     wholeReview
    // })
    const tours = await Tours.find();
    res.status(200).render('review', {
        title: 'Manage Tours',
        tours
    })
})
exports.getTours = catchAsync(async (req, res, next) => {
    const tours = await Tours.find();
    res.status(200).render('manageService', {
        title: 'Manage Tours',
        tours
    })
})

exports.updateDetails = catchAsync(async (req, res, next) => {
    const tours = await Tours.findOne({ slug: req.params.slug })
    res.status(200).render('review', {
        title: 'Update Tours',
        tours
    })
})

exports.getStats = async (req, res, next) => {

    const tourstats = await axios(`http://localhost:3000/api/v1/tours/tour-stats`, {
        method: 'GET',
    })
    const send = tourstats.data.data.stats
    res.status(200).render('stats', {
        title: 'tour Stats',
        send
    })

    const monthData = await axios('http://localhost:3000/api/v1/tours/monthly-plan/2021', {
        method: 'GET'
    })
    const plan = monthData.data.data.plan;
}
exports.getTourReview = catchAsync(async (req, res, next) => {
    const tourId = req.params.tourId
    const reviews = await Reviews.find({ tour: tourId })
    res.status(200).render('tourReview', {
        title: 'Service Review',
        reviews
    })
})
exports.getServices = catchAsync(async (req, res, next) => {
    const tours = await Tours.find();
    console.log(req);
    res.status(200).render('services', {
        title: 'Home Page',
        tours,

    });
})
exports.getRegister = catchAsync(async (req, res, next) => {
    res.status(200).render('register', {
        title: 'Register Here'
    });
})
exports.addTask = catchAsync(async (req, res, next) => {
    res.status(200).render('tasks', {
        title: 'Add Tasks'
    })
})
exports.addReminder = catchAsync(async (req, res, next) => {
    console.log(req.body);
    const newTask = await Task.create({
        name: req.body.name,
        service: req.body.service,
        date: req.body.date,
        time: req.body.time,
        userId: req.body.userId,
        userEmail: req.body.userEmail
    });
    await newTask.save()
})