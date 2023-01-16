//CATCHING ERRORS IN ASYNC FUNCTIONS---------------IMPORTANT
/**
 * @param {anonymous async function} fn 
 * This function gets executed when express makes a call to createTour Handler.
 * Automatically when express calls a function, it has middleware that includes the current request, response, and next objects
 * Then we used our captured async function (fn) and which executes the instructions inside of itself
 * If all is well then the fulfilled promise will be a resolve and that resolve sends the client a successful response object
 * else this catch function will execute and the next object(function) will be called automatically with the parameter that this catch block function receives (err)
 * global error handling middleware function
 */
module.exports = fn => (req, res, next) => {
    fn(req, res, next).catch(next) //catch passes an err object into the next function
  }