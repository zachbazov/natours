import '@babel/polyfill';
import { displayMap } from './mapbox';
import { signIn, signOut } from './sign-in';
import { updateSettings } from './update-settings';
import { bookTour } from './stripe';
import { showAlert } from './alert';

const mapBox = document.getElementById('map');
const signForm = document.querySelector('.form--sign-in');
const signOutButton = document.querySelector('.nav__el--sign-out');
const userDataForm = document.querySelector('.form-user-data');
const userPassForm = document.querySelector('.form-user-password');
const bookTourButton = document.getElementById('book-tour');

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (signForm) {
    document.querySelector('.form').addEventListener('submit', e => {
        // prevents the form from loding any other page.
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        signIn(email, password);
    });    
}

if (signOutButton) signOutButton.addEventListener('click', signOut);

if (userDataForm) userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings('data', form);
});

if (userPassForm) {
    userPassForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...'
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings('password', { passwordCurrent, password, passwordConfirm });
        document.querySelector('.btn--save-password').textContent = 'Save password'
    });
};

if (bookTourButton)
    bookTourButton.addEventListener('click', async e => {
        e.target.textContent = 'Processing...';
        // e.target - The event that got clicked.
        const { tourId } = e.target.dataset;
        await bookTour(tourId);
        e.target.textContent = 'Book Tour Now!';
    });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 6);