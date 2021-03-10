import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe('pk_test_51ITFLfJLQZ73Z8fXIKYlRg4DEQDUPHqrTlNtru7P6msZRDArC04WadDIWm1MwYYObQwcNXl2zq3xd78Z1HkphfSJ00uswAqCc0');

export const bookTour = async tourId => {
    try {
        // Gets checkout session from the API.
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
        //console.log(session);
        // Creates checkout form, charges the credit card.
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err.response.data.message);
    }
};