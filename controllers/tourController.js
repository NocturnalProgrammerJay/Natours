const Tour = require('../models/tourModel');

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

//Asynchronous Code
exports.getAllTours = async (req, res) => {
  //console.log(req.requestTime)
  try {
    // access the query string http://127.0.0.1:3000/api/v1/tours?duration=5&difficulty=easy&test=23 
    // req.query = {duration = 5, difficulty = easy, & test = 23}
    // console.log(req.query)
    /**
       *mongoDB filter method
        const tours = await Tour.find({
          duration: 5,
          difficulty: 'easy'
        })
     */
    /**
       *Mongoose filter method
          const tours = await Tour.find()
          .where('duration')
          .equals(5)
          .where('difficulty')
          .equals('easy')
     */

    // BUILD QUERY
    const queryObj = {...req.query} // destructor the fields (ex: name: 'jamar') ...req.query object (key:value pairs) then wrap it {}, creating a unique copied object
    const excludeFields = ['page', 'sort', 'limit', 'fields'] // an array of all fields we want to exclude from queryObj
    excludeFields.forEach(el => delete queryObj[el])

    const query = Tour.find(queryObj); 

    // EXECUTE QUERY
    const tours = await query

    // http://127.0.0.1:3000/api/v1/tours?difficulty=easy&page=2&sort=1&limit=10
    // { difficulty: 'easy', page: '2', sort: '1', limit: '10' } { difficulty: 'easy' }
    // console.log(req.query, queryObj)

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: tours,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    //SAME AS - Tour.findOne({_id: req.params.id}) mongoDB
    const tour = await Tour.findById(req.params.id); //mongoose

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }

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
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }

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
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

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
