const mongoose = require('mongoose')
const slugify = require('slugify')
//const validator = require('validator')
//Creating schema
//VALIDATORS ARE A GOLDEN RULE
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a tour must have a name'], //second ele is an err message
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must have less or more than 40 characters'],
    minlength: [10, 'A tour name must have more or equal than 10 characters']
    // validate:  [validator.isAlpha, 'Tour name must only contain characters'] - from npm i validator library
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour have a group size'],
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
    max: [5, 'Rating must be below 5.0']
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'a tour must have a price'],
  },
  priceDiscount: 
  {
    type: Number,
    validate: {
      // this only points to current doc on NEW document creation
      validator: function(val){
        return val < this.price // if false, triggers a validation error
      },
      message: 'Discount price ({VALUE}) should be below the regular price.' //internal mongoose value in string
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
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
    }
  },
  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
)

//executes every time we get some data from a database. 
//used a regular function because an arrow this keyword doesn't have one and its undefined.
//cannot use this in a query because it is technically not part of the database. 
tourSchema.virtual('durationWeeks').get(function(){ //this = tourSchema (current document)
  return this.duration/ 7
})

//DOCUMENT MIDDLEWARE: runs before .save() and .create() and not on .insertMany()
//slug - is a string we can add to the URL, we are going to create a slug based off the name field of an document.
tourSchema.pre('save', function(next){
  //console.log(this) this - points to the current processing document.
  this.slug = slugify(this.name, {lower: true})
  next()
})
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

//has access to documents that were returned
tourSchema.post(/^find/, function(docs, next){
  console.log(`Query took ${Date.now()-this.start} milliseconds!`)
  next()
})

// AGGREGATION MIDDLEWARE 
//this = aggregation object and has many properties
//this.pipeline is any an array of aggregated stages (in toursController getMonthlyPlan -> [{{$match: [Object]},{etc}, {etc}}])
tourSchema.pre('aggregate', function(next){
   //add element in beginning of an array. adding another stage
   //removing from the doc all the outputs of secret source set to true.
  this.pipeline().unshift({$match:{ secretTour: {$ne: true}} })
  next()
})

 
const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour
