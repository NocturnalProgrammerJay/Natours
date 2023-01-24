/* eslint-disable node/no-extraneous-require */
// Express is a function that will add a bunch of methods to the app variable.
const express = require('express')
//Morgan module returns a function that reads http request and returns a message in the console.
const morgan = require('morgan')
//for global rate limit middleware
const rateLimit = require('express-rate-limit')
const helmet = require('helmet') //security HTTP headers - a collection of multiple middlewares
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')//http parameter pollution
const path = require('path')//used to manipulate path names
const cookieParser = require('cookie-parser') //npm i cookie-parser

//OperationalErrorHandling Class
const AppError = require('./utils/appError')

const globalErrorHandler = require(`./controllers/errorController`)

//Routers
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')

//abstract layer(higher level) of nodejs - framework
const app = express()

//express sets an engine
app.set('view engine', 'pug') // npm i pug - gives us template engines
//Defines which folder the view is located in.
app.set('views', path.join(__dirname, 'views'))

//gives our middleware the ability to send static file to the browser, such as the overview.html file
//app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public')))

// 1. Middleware - typically have all of them on the app.js
//built function that can be found in a get repo. and its using its return function logger. Uses next() at the end.
//This middleware logs get request object to the console. ex: GET /api/v1/tours 200 3.399 ms - 8682
console.log(process.env.NODE_ENV)

// 1) GLOBAL MIDDLEWARES
//Set SECURITY HTTP HEADERS
app.use(helmet())//return a function until its called

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
//Controls how many API request at a time
const limiter = rateLimit({
  max: 100, //allows 100 request from a certain IP for one hour
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
})

app.use('/api',limiter)// applies limit to the all the routes that start with 'api'

//Body parser, reading data from the body into req.body
app.use(express.json({limit: '10kb'}))
app.use(cookieParser())

//express.json() returns a function and its added to the middleware stack. And be able to create our own middleware function.
// middleware = express.json(): a function that can modify the incoming request data. Its called middleware because it
//stands between receiving the request and sending the response. Its just a step that the request goes through while its being processed.

//creating a middleware function, third parameter is the express.next object
//express knows we are defining a middleware here and we can then call it whenever we want.
//This middleware applies to each and every request, because no route was specified.

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()) // returns a middleware function - prevents mongoDB query injections of the request object and filter them out

// Data sanitization against XSS
app.use(xss())// returns a middleware function - clean any user input from malicious HTML code. ex: hacker inserting html w JS code attached to it

// Prevent parameter pollution - {{URL}}api/v1/tours/sort=duration&sort=name - creates a sort array query string and we dont want the user doing this to break code.
app.use(hpp({ // clears up query string and uses the last duplicate query string, unless specified in the whitelist
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'price','difficulty', 'maxGroupSize']

}))

// app.use((req, res, next) => {
//   console.log('hello from the middleware')
   //Must call .next() or the middleware will not move on and create an infinite loop.
//   next()
// })

//test middleware
app.use((req, res, next) => {
  //console.log(req.requestTime)
  req.requestTime = new Date().toISOString()
  console.log(req.cookies)
  next()
})

// parent route/ middleware functions
// Mounting the router: mounting a new router 'tourRouter' on a route '/api/v1/tours'

app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

//Handles all https request and all other routes
app.all('*', (req, res, next) =>{
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // })

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  // err.status = 'fail'
  // err.statusCode = 404

  // express assume whatever is passed into next is an error always and skip other middleware in the stack,
  // and pass the err into the global middleware and execute it
  console.log("THIS URL ROUTE IS INVALID OR DOESNT NOT EXIST")
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})
 
app.use(globalErrorHandler)

module.exports = app
