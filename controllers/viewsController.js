const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.alerts = (req, res, next) => {
    const {alert} = req.query
    if (alert === 'booking'){
        res.locals.alert = "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show immediately, please come back later."
    }
    next()
}

exports.getOverview = catchAsync(async (req,res)=> {
    // 1) Get tour data from collection
    const tours = await Tour.find()
    // 2) Build template
    // 3) Render that template using tour data from 1)
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
})

exports.getTour = catchAsync(async(req,res,next)=>{
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    if(!tour){
        return next(new AppError('There is no tour with that name.', 404))
    }

    // 2) Build template
    // 3) Render template using data from 1)
    //renders a file(from views folder, pug file) in the clients browser 
    res
    .status(200)
    .render('tour', {
        //The pug template that will be render can use these variables below on the template. We call these variables locals.
        title: `${tour.name} Tour`,
        tour
    })
})

exports.getLoginForm = (req, res) =>{
    res.status(200).render('login', {
        title: 'Log into your account'
    })
}

exports.getAccount = (req, res) =>{
    res.status(200).render('account', {
        title: 'Your account'
    })
}

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  console.log(bookings)

  // 2) Find tours with the returned IDs
  const tourIds = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  console.log(tourIds)
  console.log(tours)

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

exports.updateUserData = async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id, {
        name: req.body.name,
        email: req.body.email
        },
        {
            new:true,
            runValidators: true
        }
    )
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    })
}