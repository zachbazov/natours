import '@babel/polyfill';
import { displayMap } from './mapbox';
import { signIn } from './sign-in';

const mapBox = document.getElementById('map');
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    //console.log(locations);
    displayMap(locations);
}

const signForm = document.querySelector('.form');
if (signForm) {
    document.querySelector('.form').addEventListener('submit', e => {
        // prevents the form from loding any other page.
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        signIn(email, password);
    });    
}