const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

const signToken = id => jwt.sign({id: id}, process.env.JWT_SECRET,{ expiresIn: process.env.JWT_EXPIRES_IN })

exports.signup = catchAsync(async (req,res,next) => {
    //const newUser = await User.create(req.body) new document based off of the model schema
    // json web token npm i jsonwebtoken
    
    //create a schema for users login
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    //jwt.sign() first param takes a object/data as the payload, second param is the secret (string), last argument is for options
    //_id comes from making a copy of the mongo generated id in the code somewhere
    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async(req, res, next) => {
    const {email, password}= req.body

    // 1) check if email and password exist
    if (!email || !password){
        return next(new AppError('Please provide email and password!', 400))
    }

    // 2) check if user exists && password is correct
    const user = await User.findOne({email}).select('+password') // how to select something thats not selected.. in model it was set to false.

    if(!user || !await user.correctPassword(password, user.password)){ //second argument is checking is the passwords match up
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) if everything ok, send token to client
    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })
})