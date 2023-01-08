const express = require('express')
const fs = require('fs')
// Express is a function that will add a bunch of methods to the app variable. 

const app = express()
app.use(express.json()) // middleware = express.json(): a function that can modify the incoming request data. Its called middleware because it
//stands between the request and the response. Its just a step that the request goes through while its being processed.
const port = 3000

/**
//GET (HTTP METHOD) that we want to response too
app.get('/', (req, res) =>{
    //.send() sends a string back to the client. Sets Content-Type: text/html
    // res.status(200).send('hello from the server side!')

    //.json() sends back a json object. Sets Content-Type: application/json
    res.status(200).json({message: 'hello from the server side!', app: 'Natours'})
})

app.post('/', (req,res)=>{
    res.send('you can send post to this endpoint')
})
*/

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

app.post('/api/v1/tours', (req,res) => {
    //console.log(req.body) -- client sends a json object to server, server parses it to a js object. 
    
    res.send('done')
})

app.get('/api/v1/tours', (req,res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours
        }
    })
})

// Emitter - starts server
app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})