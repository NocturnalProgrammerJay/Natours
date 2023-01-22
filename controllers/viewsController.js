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

exports.getTour = (req,res,)=>{
    //renders a file in the clients browser 
    res.status(200).render('tour', {
        //The pug template that will be render can use these variables below on the template. We call these variables locals.
        title: 'The Forest Hiker Tour'
    })
}