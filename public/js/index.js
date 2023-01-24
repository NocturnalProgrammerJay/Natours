/* eslint-disable */
import '@babel/polyfill' //makes new es6 js work in older js browsers. npm i @babel/polyfill 
import {displayMap} from './mapbox'
import {login} from './login'

console.log('HELLO FROM PARCEL')
// DOM ELEMENTS
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form')

// DELEGATION
if(mapBox){
    //this is the tour.locations that we received from the frontend on the tour.pug file. A Json obj converted to a string stored in the elements dataset variable.

    const locations = JSON.parse(mapBox.dataset.locations)
    displayMap(locations)
}

if(loginForm)
    loginForm.addEventListener('submit', e =>{
        e.preventDefault()

        // VALUES
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })

