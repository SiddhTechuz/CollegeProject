const express = require('express')
const router = express.Router()
const viewController = require('../controllers/viewController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')
// const tourController = require('../controllers/tourController')





router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)
router.get('/login', authController.isLoggedIn, viewController.login)
router.get('/signup', viewController.signup)
router.get('/me', authController.protect, viewController.getAccount)
router.get('/my-tours', authController.protect, viewController.getMyTours)
router.get('/my-reviews', authController.protect, viewController.getMyReviews)
router.get('/manage-services', viewController.getTours)
router.get('/manage-users', viewController.getUsers)
router.get('/services', authController.isLoggedIn, viewController.getServices)
router.get('/provide/register', viewController.getRegister)
router.get('/add-task', authController.isLoggedIn, authController.protect, viewController.addTask)


router.get('/manage-reviews', authController.isLoggedIn, viewController.getReviews)
router.get('/review/:tourId', authController.isLoggedIn, viewController.getTourReview)

router.get('/stats', authController.isLoggedIn, viewController.getStats)
router.get('/tour/update/:slug', viewController.updateDetails)

router.get('/manage-bookings', authController.protect, viewController.getManageBooking)
router.get('/booking/:tourId', authController.protect, viewController.userbooktour)

router.post('/add', viewController.addReminder)
router.post('/submit-user-data', authController.protect,
    viewController.updateUserData)
module.exports = router;