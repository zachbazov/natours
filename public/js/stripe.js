var stripe = Stripe('pk_test_51ITFLfJLQZ73Z8fXIKYlRg4DEQDUPHqrTlNtru7P6msZRDArC04WadDIWm1MwYYObQwcNXl2zq3xd78Z1HkphfSJ00uswAqCc0');
import axios from 'axios';

export const bookTour = async tourId => {
    // Gets checkout session from the API.
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    // Creates checkout form, charges the credit card.

};