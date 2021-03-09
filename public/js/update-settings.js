import axios from 'axios';
import { showAlert } from './alert';

// type - Either name/email or password.
export const updateSettings = async (type, data) => {
    try {
        const url = 
            type === 'password' 
                ? 'http://127.0.0.1:3000/api/v1/users/update-password' 
                : 'http://127.0.0.1:3000/api/v1/users/update-user-profile'

        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if (res.data.status === 'success') {
            showAlert('success', `${type} updated successfully`);
            window.setTimeout(() => location.assign('/account') ,2000);
        }

    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};