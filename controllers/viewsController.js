const Tour = require('../models/tourModel')
const catchAsync = require('../utils/catchAsync')

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

exports.getTour = catchAsync(async(req,res,)=>{
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })
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