const crypto = require('crypto')
const {promisify} = require('util') //node built in module called util - has a built in promisify method called promisify
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
//const sendEmail = require('../utils/email')
const Email = require('../utils/email')

const signToken = id => jwt.sign({id: id}, process.env.JWT_SECRET,{ expiresIn: process.env.JWT_EXPIRES_IN }) //uses the id, secret to generate a random jwt string

const createSendToken = (user, statusCode, req, res) => {

    const token = signToken(user._id)

    res.cookie('jwt', token, {
        //converts 90 days into milliseconds - 90*24*60*60*1000
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true, //the browser will only be able to receive the cookie, store it, and send it automatically along with every request.
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'// cookie will only be sent on an encrypted connection, https
      }
    )

    //Remove the password from the output
    res.password = undefined

    //sends a cookie to the client
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user
        }
    })
}

exports.signup = catchAsync(async (req,res,next) => {
    const newUser = await User.create(req.body) //new document based off of the model schema

    const url = `${req.protocol}://${req.get('host')}/me`

    await new Email(newUser, url).sendWelcome()

    // json web token npm i jsonwebtoken
    createSendToken(newUser,201, req, res)
    //jwt.sign() first param takes a object/data as the payload, second param is the secret (string), last argument is for options
    //_id comes from making a copy of the mongo generated id in the code somewhere
})

exports.login = catchAsync(async(req, res, next) => {
    const {email, password} = req.body

    // 1) check if email and password exist
    if (!email || !password){
        return next(new AppError('Please provide email and password!', 400))
    }
    // 2) check if user exists && password is correct
    const user = await User.findOne({email}).select('+password') // how to select something thats not selected.. in model it was set to false.

    if(!user || !await user.correctPassword(password, user.password)){ //second argument is checking is the passwords match up
        return next(new AppError('Incorrect email or password', 401))
    }
    // 3) if everything ok, send token to client - the token 
    createSendToken(user,201, req, res)
})

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now()+10*1000),
    httpOnly: true
  })
  res.status(200).json({status: 'success'})
}

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt){
    token = req.cookies.jwt
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
  try{
    if (req.cookies.jwt){
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      
      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      
      // THERE IS A LOGGED USER
      /**
       * res.locals An object that contains response local variables scoped to the request, 
       * and therefore available only to the view(s) rendered during that request / response cycle (if any). 
       */
      res.locals.user = currentUser;
      return next();
    }
  }catch(err){
    return next()
  }
  next()
};

//Restrict certain routes to certain user roles: Authorization
/**
 * The main difference between rest and spread is that the rest operator puts the rest of some specific user-supplied values into a JavaScript array. 
 * But the spread syntax expands iterables into individual elements
 */
exports.restrictTo = (...roles) => (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
}

exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('There is no user with email address.', 404))
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave: false}) //deactivate all the validators im the schema 
    
    try{
      // 3) Send it to user's email
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
      await new Email(user,resetURL).sendPasswordReset()

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    }catch(err){
        user.passwordResetToken = undefined
        user.passwordResetToken = undefined
        await user.save({validateBeforeSave: false})

        return next(new AppError('There was an error sending the email. Try again later!', 500))
    }
})

exports.resetPassword = catchAsync(async(req,res,next)=>{
    // 1) Get user based on the token - encrypt og token again and compare it to the encrypted one in the database
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    //if passwordResetExpires: {$gte: Date.now()} is greater than right now then it hasnt yet expired
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gte: Date.now()}})

    // 2) If token has not expired, and there is user, set the new password
    if(!user){
        return next(new AppError('Token is invalid or has expired', 400))
    }
    
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 3) Update changedPasswordAt property for the user 

    // 4) Log the user in, send JWT
    createSendToken(user,200,req,res)
})

exports.updatePassword = catchAsync(async(req, res, next) => {
    console.log('executed')
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password')

    // 2) Check if POSTed current password
    if(!(user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('Your current password is wrong', 401))
    }
    // 3) If so, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    // 4) log user in, send JWT
    createSendToken(user,200,req,res)
})

