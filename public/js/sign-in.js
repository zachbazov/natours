import axios from 'axios';
import { showAlert } from './alert';

export const signIn = async (email, password) => {
    console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/sign-in',
            data: { email, password }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Signed in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }

        console.log(res);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};