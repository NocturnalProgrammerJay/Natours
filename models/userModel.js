const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: 8,
        select: false //hides itself in the output
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //  This only works on create or  save!
            validator: function(el){
                return el === this.password 
            }
        },
        message: 'Passwords are not the same!', // err message
        select: false //hides itself in the output
    }
})

//pre save document middleware
userSchema.pre('save', async function(next){
    // this.isModified checks if current document password has been modified.
    if(!this.isModified('password')) return next() 

    // encryption - npm i bcryptjs, salt = random string that was generated. second parameter is the cost measure this intensive cpu operation will be
    /**
     *  Password salting is a technique to protect passwords stored in databases
     *  by adding a string of 32 or more characters and then hashing them. 
     * Salting prevents hackers who breach an enterprise environment
     *  from reverse-engineering passwords and stealing them from the database.
     */
    this.password = await bcrypt.hash(this.password, 12)
    // delete passwordConfirm field
    this.passwordConfirm = undefined
    next()
})

//instance method is available on all documents of a specific collection.
// this = current document
// candidatepassword is the original password not hashed and userpassword is the password thats hashed
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

const User = mongoose.model('User', userSchema)

module.exports = User