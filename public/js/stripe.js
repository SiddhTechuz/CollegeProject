const stripe = Stripe('pk_test_51P2WvBSBj9fLWcyseSBWSKlQSeORY0uulraK9ch3E6DRclrDiwHd8AdzgNINELUwxFI6IDukWkKrGqJk4oMhiuQH00pJOoquG1');
const bookbtn = document.getElementById('book-tour');

const bookTour = async tourId => {
    try {
        //1) Get checkout session from API
        const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
        console.log(session);

        //2) Create Checkout form +charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })

    }
    catch (err) {
        console.log(err);
    }
};

if (bookbtn) {
    bookbtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...'
        const { tourId } = e.target.dataset;
        bookTour(tourId)
    })
}