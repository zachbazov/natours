import axios from 'axios';
import { showAlert } from './alert';

export const signUp = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/sign-up',
            data: { name, email, password, passwordConfirm }
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Your account has been created successfully.');
            window.setTimeout(() => {
                location.assign('/sign-in');
            }, 2000);
        }
    } catch (err) {
        console.error(err);
        showAlert('error', err.response.data.message)
    }
};

export const signIn = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/sign-in',
            data: { email, password }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Signed in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 2000);
        }
    } catch (err) {
        console.log(err);
        showAlert('error', err.response.data.message);
    }
};

export const signOut = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/sign-out'
        });
        
        if (res.data.status === 'success') {
            showAlert('success', 'Signing off...');
            window.setTimeout(() => {
                location.assign('/');
            }, 2000);
        }

    } catch (err) {
        console.log(err.response);
        showAlert('error', 'Failed to sign out, try again.');
    }
}