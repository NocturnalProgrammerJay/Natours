const mongoose = require('mongoose')
const dotenv = require('dotenv')

//environment error listener
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.log(err.name, err.message)

})

//This process is than global in the application and only needs to occur once and available in every file during the process.
//config() - The command will now read our variables from the file and save them into nodeJS environment variables.
dotenv.config({ path: './config.env' })
const app = require('./app')

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

//HOST VERSION
//connect method returns a promise and the second argument is for optional deprecated reasons
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  // .then(() => console.log('DB connection successful!'))

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 9.97,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(`ERROR 💥`, err);
//   });

//LOCAL VERSION
// mongoose
//   .connect(process.env.DATABASE_LOCAL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//   })
//   .then((con) => {
//     //con = a connection object;
//     console.log(con.connections);
//   })



//console.log(process.env) // (process) nodejs variable

/** 
//express environment variable
console.log(app.get('env'))

//nodejs environment variable
console.log(process.env)
*/

// 4. Emitter - starts server
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`)
})

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 shutting down...')
  console.log(err.name, err.message) 

  // server finishes request that are pending or handling and then kill server.
  server.close( () => {
    process.exit(1) // 1 means uncalled exception and 0 means success 
  })
})

