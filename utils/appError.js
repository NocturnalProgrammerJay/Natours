class AppError extends Error{ //handles operational errors: user faulty input
    constructor(message, statusCode){
        //creating a Error instance and passing a message variable to that constructor, giving it variables and methods to use.
        //also creates a property this.message = message for us.
        super(message) 
        // this.message = message
        this.statusCode = statusCode
        this.status =  `${statusCode}`.startsWith('4') ? 'fail' : 'error'             //either be fail(400) or error(500), depends on the status code.
        this.isOperational = true

        /**
         * this way when a new object
         * is created, and a constructor function is called,
         * then that function call is not gonna appear
         * in the stack trace, and will not pollute it.
         */
        Error.captureStackTrace(this, this.constructor)
    }   
}
module.exports = AppError