const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY) //backend script "npm i stripe@7.0.0"
const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const catchAsync = require('../utils/catchAsync')
// const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

exports.getCheckoutSession = catchAsync(async(req, res, next) =>{
     // 1) Get the currently booked tour

     console.log("HELLO FROM CHECKOUT")
    const tour = await Tour.findById(req.params.tourId)

    const transformedItems = [{
        quantity: 1,
        price_data: {
            currency: "usd",
            unit_amount: tour.price * 100,
            product_data: {
                name: `${tour.name} Tour`,
                description: tour.description, //description here
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], //only accepts live images (images hosted on the internet),
            },
        },
    }]

     // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`, //user will be redirected to this url when payment is successful. home page
        cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`, //user will be redirected to this url when payment has an issue. tour page (previous page)
        customer_email: req.user.email,
        client_reference_id: req.params.tourId, //this field allows us to pass in some data about this session that we are currently creating.
        line_items: transformedItems,
        mode: 'payment',

    })

     // 3) Create session as response
     res.status(200).json({
        status: 'success',
        session
     })
})

exports.createBookingCheckout = catchAsync(async(req, res, next) => {
    // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
    const {tour, user, price} = req.query
    console.log(req.query)

    if(!tour && !user && !price) return next()

    await Booking.create({tour, user, price}) // new Document

    //makes a new request to the root url
    //this is hit the bookingController again but the tour, user, and price will not be found in the req.query and go to the next middleware to take user to the viewController and render the homepage.
    res.redirect(req.originalUrl.split('?')[0])
    //next()
    
})

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)