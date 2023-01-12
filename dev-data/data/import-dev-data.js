const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('../../models/tourModel')

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
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
) //converts json into js object

const importData = async () => {
    try{
        await Tour.create(tours)
        console.log('data successfully loaded!')
    }catch(err){
        console.log(err);
    }
    process.exit()
}

//Delete all data from db
const deleteData = async () =>{
    try{
        await Tour.deleteMany() //delete all documents in the Tour collection
        console.log('data successfully deleted!')
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
 * node dev-data/data/import-dev-data.js --import
 * node = 'C:\\Program Files\\nodejs\\node.exe'
 * dev-data/data/import-dev-data.js = 'C:\\Users\\Jamar Andrade\\Desktop\\NodeJS\\4-natours\\starter\\dev-data\\data\\import-dev-data.js'
 * --import = --import
 */