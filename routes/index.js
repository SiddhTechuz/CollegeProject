const routes = require('express').Router();
const tourRouter = require('./tourRoutes')
const userRouter = require('./userRoutes')
const reviewRouter = require('./reviewRoutes')
const bookingRouter = require('./bookingRoutes')

routes.use('/tours', tourRouter)
routes.use('/users', userRouter)
routes.use('/reviews', reviewRouter)
routes.use('/bookings', bookingRouter)


module.exports = routes