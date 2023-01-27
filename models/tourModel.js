const mongoose = require('mongoose')
const slugify = require('slugify')
const User = require('./userModel')
//const validator = require('validator')
//Creating schema
//VALIDATORS ARE A GOLDEN RULE
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,//type mongodb id 
        ref: 'User'
      } 
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Performance queries. mongo provided only the documents that in asc order according to price, when user query price based on value, it probably does a binary search
// 1 - means asc order, -1 dsc order, field indexing.
// tourSchema.index({price: 1})

//compound index
tourSchema.index({ratingsAverage: -1, price: 1})

// the slug will query for tours
tourSchema.index({slug: 1}) 
tourSchema.index({startLocation: '2dsphere'})

//executes every time we get some data from a database. 
//used a regular function because an arrow this keyword doesn't have one and its undefined.
//cannot use this in a query because it is technically not part of the database. 
tourSchema.virtual('durationWeeks').get(function(){ //this = tourSchema (current document)
  return this.duration/ 7
})

//Virtual populate - child referencing without persisting the data onto the db
//make sure current user created an review for a certain tour, then use get tour on that certain tour to view the review
tourSchema.virtual('reviews', {
  ref: 'Review', // connects to Review schema, creates a field called reviews in tour schema and links attributes with tour and id values.
  foreignField: 'tour', //
  localField: '_id' //
})

//DOCUMENT MIDDLEWARE: runs before .save() and .create() and not on .insertMany()
//slug - is a string we can add to the URL, we are going to create a slug based off the name field of an document.
tourSchema.pre('save', function(next){
  //console.log(this) this - points to the current processing document.
  this.slug = slugify(this.name, {lower: true})
  next()
})

/**
 * -----------------------------------> KEEP THESE 3 middleware commented below.
 */
// //Create embedded guides in tour document
// tourSchema.pre('save', async function(next) {
//   //returns an array of promises - mapping through each element in the guide field from the sent data from user. want array of user ids for this tour doc guide object
//   const guidesPromises = this.guides.map(async id => await User.findById(id)) //.findById is an async function so must be awaited.
//   this.guides = await Promise.all(guidesPromises) //runs all promises at the same time, so our function must be async to await the promises in the array.
//   next()
// })
 
//CREATE NEW TOUR
// tourSchema.pre('save', function(next) {
//   console.log('will save doc')
//   next()
// })

// tourSchema.post('save', function(doc,next){
//   console.log(doc)
//   next()
// })

// QUERY MIDDLEWARE: executes based whats passed in the first argument and when it goes off in the program, this will execute. 
// this = points to the current query object of the document.
// could be used for tours for VIP's that typically hidden.
// tourSchema.pre('find', function(next){
// if a specific route uses the .findById() or anything thats not a .find() this wont get executed. 
// Unless we use regex to work for all functions w the word find inside of it.
tourSchema.pre(/^find/, function(next){
  this.find({secretTour: {$ne: true}})
  this.start = Date.now()
  next()
})

//works for every query operator that starts with find
tourSchema.pre(/^find/, function(next){
  this.populate({ 
    path: 'guides',
    select: '-__v -passwordChangedAt'
  }) 
  next()
})

//has access to documents that were returned
tourSchema.post(/^find/, function(docs, next){
  console.log(`Query took ${Date.now()-this.start} milliseconds!`)
  next()
})


// AGGREGATION MIDDLEWARE 
//this = aggregation object and has many properties
//this.pipeline is any an array of aggregated stages (in toursController getMonthlyPlan -> [{{$match: [Object]},{etc}, {etc}}])
// tourSchema.pre('aggregate', function(next){
//    //add element in beginning of an array. adding another stage
//    //removing from the doc all the outputs of secret source set to true.
//   this.pipeline().unshift({$match:{ secretTour: {$ne: true}} })
//   console.log(this.pipeline())
//   next()
// })

 
const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour
