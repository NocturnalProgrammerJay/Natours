/**
 * REQUEST RESPONSE CYCLE
 *
 * All middleware in the application is called the middleware stack.
 * The order of middleware in the stack is actually defined by the order they are defined in the code. FIFO.
 * The request and response object can pass through the middleware stack, until they reach the last one. PIPELINE.
 * ex: start -> middleware1 next.(), middleware2 next.(), middleware3 next.(),middleware4 res.end() <-- finishes the cycle.
 * */

const AppError = require("../utils/appError")

//express will see this as a error handling middleware because this function has four arguments.

const sendErrorDev = (err,req, res) => {
    // A) API
    if(req.originalUrl.startsWith('/api')){
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    // B) RENDERED WEBSITE
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        })
    
}

const sendErrorProd = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')){
        // A) Operational, trusted error: send message to client
        if (err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
            // Programming or other unknown error: don't leak error details
        } 

        // 1) Log error 
        console.log('ERROR 💥💥', err.message)
        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        })
    }
    // B) RENDERED WEBSITE
    if (err.isOperational){
        return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    })
    } 
    // Programming or other unknown error: don't leak error details
    // 1) Log error 
    console.log('ERROR 💥💥', err.message)
    
    // 2) Send generic message
    return res.status(500).render('error', {
        status: 'Something went wrong!',
        message: 'Please try again later.'
    })
    
}

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid token, please log in again', 401)

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again', 401)

module.exports = (err, req, res, next)=>{
  //console.log(err.stack)//stack trace from Error object
  err.statusCode = err.statusCode || 500 //statusCode will be read from err object and can be in range 400-500, 500 is a server error
  err.status = err.status || 'error'

  if(process.env.NODE_ENV === 'development'){
      sendErrorDev(err, req, res)
  }
  else if (process.env.NODE_ENV === 'production'){
    // -----------------------NOT A TRUE DEEP CLONE
    let error = { ...err }
    error.message = err.message

    if (err.name === 'CastError'){ 
        error = handleCastErrorDB(error)
    }
    if (err.code === 11000){ 
        error = handleDuplicateFieldsDB(error)
    }
    if (err.name === 'ValidationError'){
        error = handleValidationErrorDB(error)
    }
    if(err.name === 'JsonWebTokenError'){
        error = handleJWTError()
    }
    if(err.name === 'TokenExpiredError'){
        error = handleJWTExpiredError()
    }
    sendErrorProd(error, req, res)
  }
}