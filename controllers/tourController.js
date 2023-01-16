const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
//2. ROUTE HANDLERS
//Synchronous Code
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  console.log("HELLO");
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}


//Asynchronous Code
exports.getAllTours = catchAsync(async (req, res, next) => {
  //console.log(req.requestTime)
 
    // access the query string http://127.0.0.1:3000/api/v1/tours?duration=5&difficulty=easy&test=23 
    // req.query = {duration = 5, difficulty = easy, & test = 23}
    // console.log(req.query)
    
       //mongoDB filter method
      //   const tours = await Tour.find({
      //     duration: 5,
      //     difficulty: 'easy'
      //   })
     
    
      //  Mongoose filter method
      //     const tours = await Tour.find()
      //     .where('duration')
      //     .equals(5)
      //     .where('difficulty')
      //     .equals('easy')
     

    // BUILD QUERY
    // 1A) Filtering 
    // const queryObj = {...req.query} // destructor the fields (ex: name: 'jamar') ...req.query object (key:value pairs) then wrap it {}, creating a unique copied object
    // const excludeFields = ['page', 'sort', 'limit', 'fields'] // an array of all fields we want to exclude from queryObj
    // excludeFields.forEach(el => delete queryObj[el])

    // // 1B) Advanced filtering
    // let queryStr = JSON.stringify(queryObj)
    // //adds $ to the field of gte:5, coming from http://127.0.0.1:3000/api/v1/tours?difficulty[gte]=5 { gte:5 } we need { $gte:5 } to filter in mongodb
    // //console.log(JSON.parse(queryStr));
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    // //const query = Tour.find(queryObj); 
    // let query = Tour.find(JSON.parse(queryStr)); 

    // // 2) SORTING
    // if (req.query.sort){ // original object
    //   const sortBy = req.query.sort.split(',').join(' ')
    //   query = query.sort(sortBy)
    //   //http://127.0.0.1:3000/api/v1/tours?sort=price,ratingsAverage
    //   //how to sort by multiple params in mongodb, sort('price ratingsAverage')
    // }else{
    //   query = query.sort('-createdAt')
    // }

    // // 3) FIELD LIMITING
    // if (req.query.fields){
    //   // ex: http://127.0.0.1:3000/api/v1/tours?fields=name,duration,difficulty,price
    //   // ex: http://127.0.0.1:3000/api/v1/tours?fields-=name,duration,difficulty,price the '-' means return all the data without these fields name, duration, difficulty, and price
    //   const fields = req.query.fields.split(',').join(' ') // 
    //   query = query.select(fields) //projection - selecting only specific fields:values from the object
    // }else{
    //   query = query.select('-__v') // '-' excluding only this field
    // }

    // // 4) Pagination
    // const page = req.query.page * 1 || 1 //defaults to 1
    // const limit = req.query.limit * 1 || 100 //defaults to 100
    // const skip = (page - 1) * limit //if page = 3 we want results of (21 through 30) so 3 - 1 * 10 = 20, if we skip 20 then we are at result # 21

    // // limit means amount of results we want in the query, skip means the amount of queries that should be skipped before querying data
    // // /?page=2&limit=10 the user wants page 2 with 10 results. means results 1-10 is one page 1 and 11-20 is on page 2
    // query = query.skip(skip).limit(limit)

    // if(req.query.page){
    //   const numTours = await Tour.countDocuments() //return number of documents
    //   // if the number of documents that we skip are greater than the number of documents that exist then throw error
    //   if (skip >= numTours) throw new Error(`This page does not exists`)
    // }

    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().paginate()
    const tours = await features.query

    // http://127.0.0.1:3000/api/v1/tours?difficulty=easy&page=2&sort=1&limit=10
    // { difficulty: 'easy', page: '2', sort: '1', limit: '10' } { difficulty: 'easy' }
    // console.log(req.query, queryObj)

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: tours,
    });
})

exports.getTour = catchAsync(async (req, res, next) => {
  //SAME AS - Tour.findOne({_id: req.params.id}) mongoDB
  const tour = await Tour.findById(req.params.id); //mongoose
  

  if (!tour){
    return next(new AppError('No tour found with that ID', 404))
  }

  
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
})
  // req.params is where all the variables in the url are stored ex: (/:id). The variables in the url are called parameters.
  // '/api/v1/tours/:id/:x/:y? the ? creates optional parameters and if the user does '/api/v1/tours/4/5?' we get back {id:4,x:5, y:undefined}
  // console.log(req.params)  {id:5}
  //const id = req.params.id * 1; //convert string to integer
  //   const tour = tours.find((el) => el.id === id);
  //   // if (id > tours.length){
  //   if (!tour) {
  //     return res.status(404).json({
  //       status: 'Fail',
  //       message: 'Invalid ID',
  //     });
  //   }
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       tour: tour,
  //     },
  //   });


// catchAsync should only be called when someone hits the createTour route
// catchAsync executes the async function and returns a promise or resolved or rejected to createTour handler.
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    }
  })
})


  //console.log(req.body) -- client sends a json object to server, server parses it to a js object.
  //   const newId = tours[tours.length - 1].id + 1;
  //   const newTour = Object.assign({ id: newId }, req.body); //object.assign() merges two objects together

  //   tours.push(newTour);
  //   //1. Rewrite the json fileJSON.
  //   //2. Stringify(tours) to place it into the json file
  //   fs.writeFile(
  //     `${__dirname}/dev-data/data/tours-simple.json`,
  //     JSON.stringify(tours),
  //     (err) => {
  //       //Status code 201: means created
  //       res.status(201).json({
  //         status: 'success',
  //         data: {
  //           tour: newTour,
  //         },
  //       });
  //     }
  // );


exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour){
    return next(new AppError('No tour found with that ID', 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour){
    return next(new AppError('No tour found with that ID', 404))
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

/**
//GET (HTTP METHOD) that we want to response too
app.get('/', (req, res) =>{
    //.send() sends a string back to the client. Sets Content-Type: text/html
    // res.status(200).send('hello from the server side!')

    //.json() sends back a json object. Sets Content-Type: application/json
    res.status(200).json({message: 'hello from the server side!', app: 'Natours'})
})

app.post('/', (req,res)=>{
    res.send('you can send post to this endpoint')
})
*/

//HTTP METHOD provides two objects as parameters to the callback function argument. Request and Response.
//app.get('/api/v1/tours', getAllTours)
// app.post('/api/v1/tours', createTour)
// app.get('/api/v1/tours/:id?', getTour)
// app.patch('/api/v1/tours/:id', updateTour)
// app.delete('/api/v1/tours/:id', deleteTour)

// 3. ROUTES - .route() separates the route the one time and chain the http request methods that does with it. DRY principle.
//These are also middleware functions but they only apply to a certain routes.

// app
//     .route('/api/v1/tours')
//     .get(getAllTours)
//     .post(createTour)

exports.getTourStats = catchAsync(async (req, res, next) => {
  //AGGREGATION PIPELINE
  const stats = await Tour.aggregate([ //able to manipulate data, passes stages in the argument array and a object
  {
    $match: {
      ratingsAverage: {$gte: 4.5}
    }
  },
  {
    $group: {
      _id: { $toUpper:'$difficulty'}, // GROUP results for different fields. example: $difficulty - easy medium hard
      numTours: {$sum: 1}, // for each document this num counter gets incremented
      numRatings: { $sum: '$ratingQuantity'},
      avgRating:{ $avg: '$ratingsAverage'},
      avgPrice: { $avg: '$price'},
      minPrice: { $min: '$price'},
      maxPrice: { $max: '$price'},
    }
  },
  {
    $sort: {avgPrice: 1} //1 = ascending
  },
  // {
  //   $match: {_id: { $ne: 'EASY'}} ne = not equal
  // }
  ]) 

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1
  const plan = await Tour.aggregate([
      {
        $unwind: '$startDates' // $unwind - if a tour as an array of 3 startDates then this will create 3 tours, each with a specified create date
      },
      {
        $match: {
        startDates: { 
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates'}, //month
          numTourStarts: { $sum:1}, // how many tours in this month
          tours: {$push: '$name'} //creates an array of tour names that match with each others month
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project:{
          _id: 0 //projection - gets rid of _id field. why? we use it to help our query search, but then after we wanna remove it
        }
      },
      {
        $sort: {
          numTourStarts: -1  // 1 sec -1 desc
        }
      },
      {
        $limit: 12
      }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
})

