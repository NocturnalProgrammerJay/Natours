/* eslint-disable */
import '@babel/polyfill' //makes new es6 js work in older js browsers. npm i @babel/polyfill 
import {displayMap} from './mapbox'
import {login, logout } from './login'
import {updateSettings} from './updateSettings'

console.log('HELLO FROM PARCEL')
// DOM ELEMENTS
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data') 
const userPasswordForm = document.querySelector('.form-user-password') 

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

if (logOutBtn) logOutBtn.addEventListener('click', logout)

// if (userDataForm)
//     userDataForm.addEventListener('submit', async e => {
//         e.preventDefault()
//         const form = new FormData()//programmatically recreate a multipart form data. WEB API

//         form.append('name', document.getElementById('name').value) //key : value
//         form.append('email', document.getElementById('email').value)
//         form.append('photo', document.getElementById('photo').files[0])
//         console.log(form)
//         await updateSettings(form, 'data')//ajax using axios we recognize this form as an object as before
//     })

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });


