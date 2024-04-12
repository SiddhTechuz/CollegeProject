const express = require('express');
const path = require('path')
const morgan = require('morgan')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const schedule = require('node-schedule')
// const tourRouter = require('./routes/tourRoutes')
// const userRouter = require('./routes/userRoutes')
// const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const routes = require('./routes/index')
const bodyParser = require('body-parser')
const app = express();
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const findTask = require('./utils/reminder')
//middleware
app.use(morgan('dev'))




app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//global middlewares

//serving static files
app.use(express.static(path.join(__dirname, 'public')))
//security HTTPheader
app.use(helmet())


//Limit Request
const limiter = rateLimit({
    max: 150,
    window: 60 * 60 * 1000, //60 min window me  max 150 times request kr skte h 
    //status 429 --> for too many requests
    message: "Too nmany attempts , please try again after some time"
})
app.use('/api', limiter);

//body parser ,reading data from body into req.body
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser())

//data sanitization against NoSQL query injection 
app.use(mongoSanitize()); // filter all of the dollar signs and dots...so basically how a mongo query is written

//data sanitization against XSS
app.use(xss())


//prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsQunatity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']

}))
app.use(function (req, res, next) {
    res.setHeader('Content-Security-Policy', "script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com https://cdn.jsdelivr.net 'self' 'unsafe-inline' blob:");
    next();
})

schedule.scheduleJob('*/1 * * * *', () => {
    setImmediate(findTask)
});


//routes
app.use('/', viewRouter)
app.use('/api/v1/', routes)


// app.use('/api/v1/tours', tourRouter)
// app.use('/api/v1/users', userRouter)
// app.use('/api/v1/reviews', reviewRouter)


app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on the server`);
    // err.status = 'fail'
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on the server`), 404);

})


app.use(globalErrorHandler)

module.exports = app; 
