import axios from 'axios';
import { showAlert } from './alert';

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