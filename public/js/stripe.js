import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async tourId => {
    try {
        const stripe = Stripe('pk_test_51ITFLfJLQZ73Z8fXIKYlRg4DEQDUPHqrTlNtru7P6msZRDArC04WadDIWm1MwYYObQwcNXl2zq3xd78Z1HkphfSJ00uswAqCc0');
        // Gets checkout session from the API.
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
        //console.log(session);
        // Creates checkout form, charges the credit card.
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};