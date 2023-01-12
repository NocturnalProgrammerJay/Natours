// Express is a function that will add a bunch of methods to the app variable.
const express = require('express');
//Morgan module returns a function that reads http request and returns a message in the console.
const morgan = require('morgan');

//Routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//abstract layer(higher level) of nodejs - framework
const app = express();

// 1. Middleware - typically have all of them on the app.js
//built function that can be found in a get repo. and its using its return function logger. Uses next() at the end.
//This middleware logs get request object to the console. ex: GET /api/v1/tours 200 3.399 ms - 8682
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
//express.json() returns a function and its added to the middleware stack. And be able to create our own middleware function.
// middleware = express.json(): a function that can modify the incoming request data. Its called middleware because it
//stands between receiving the request and sending the response. Its just a step that the request goes through while its being processed.

//creating a middleware function, third parameter is the express.next object
//express knows we are defining a middleware here and we can then call it whenever we want.
//This middleware applies to each and every request, because no route was specified.

//gives our middleware the ability to send static file to the browser, such as the overview.html file
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('hello from the middleware');

  //Must call .next() or the middleware will not move on and create an infinite loop.
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//parent route/ middleware functions
// Mounting the router: mounting a new router 'tourRouter' on a route '/api/v1/tours'
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
/**
 * REQUEST RESPONSE CYCLE
 *
 * All middleware in the application is called the middleware stack.
 * The order of middleware in the stack is actually defined by the order they are defined in the code. FIFO.
 * The request and response object can pass through the middleware stack, until they reach the last one. PIPELINE.
 * ex: start -> middleware1 next.(), middleware2 next.(), middleware3 next.(),middleware4 res.end() <-- finishes the cycle.
 * */

module.exports = app;
