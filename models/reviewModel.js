// review / rating / createdAt / ref to tour/ ref to user 
const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

//Prevent duplicate reviews
reviewSchema.index({tour: 1, user: 1}, {unique: true})

reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // })

    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

//Aggregation pipeline update
//this = current model
reviewSchema.statics.calcAverageRatings = async function(tourId){
  const stats = await this.aggregate([
    {
      $match: {tour: tourId}
    },
    {
      $group: {
        _id: '$tour',
        nRating: {$sum: 1}, //calculating tour reviews based on review schema of a certain tour
        avgRating: {$avg: '$rating'} //calculating tour rating averages based on review schema of a certain tour
      }
  },
  ])
  //console.log(stats)
  if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating, 
      ratingsAverage: stats[0].avgRating
    })
  }
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    })
}

//AFTER User changes their rating on a specific tour, then our tour ratingsAverage will update accordingly using the function above
//this - current review doc
reviewSchema.post('save', function(){
  //this.constructor is the current model - the one who created the document
  this.constructor.calcAverageRatings(this.tour)
})

//findByIdAndUpdate
//findByIdAndDelete
//when the user queries the db, ratingsAverage will update if the user updates or remove a tour
reviewSchema.pre(/^findOneAnd/, async function(next){
  this.r = await this.findOne()//query of multi tuples findOneAnd ... operations in the current document
  console.log(this.r)
  next()
})

reviewSchema.post(/^findOneAnd/, async function(){
  await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review

