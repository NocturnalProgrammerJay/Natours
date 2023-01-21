const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('../../models/tourModel')
const Review = require('../../models/reviewModel')
const User = require('../../models/userModel')

dotenv.config({ path: './config.env' })

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'))

//Read JSON INTO DB
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')) //converts json into js object
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')) //converts json into js object
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')) //converts json into js object

//IMPORT DATA INTO DB
const importData = async () => {
    try{
        await Tour.create(tours)
        await User.create(users, {validateBeforeSave: false})
        await Review.create(reviews)
        console.log('Data successfully loaded!')
    }catch(err){
        console.log(err);
    }
    process.exit()
}

//Delete all data from db
const deleteData = async () =>{
    try{
        await Tour.deleteMany() //delete all documents in the Tour collection
        await User.deleteMany() 
        await Review.deleteMany() 
        console.log('Data successfully deleted!')
    }catch(err){
        console.log(err)
    }
    process.exit()
}

if (process.argv[2] === '--import'){
    importData()
} else if (process.argv[2] === '--delete'){
    deleteData()
}

// console.log(process.argv) 
// terminal input becomes an of arguments
/**
 * node dev-data/data/import-dev-data.js --delete
 * node ./dev-data/data/import-dev-data --import
 * node = 'C:\\Program Files\\nodejs\\node.exe'
 * dev-data/data/import-dev-data.js = 'C:\\Users\\Jamar Andrade\\Desktop\\NodeJS\\4-natours\\starter\\dev-data\\data\\import-dev-data.js'
 * --import = --import
 */