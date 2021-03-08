const form = document.querySelector('.form');

const signIn = async (email, password) => {
    console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/sign-in',
            data: { email, password }
        });

        if (res.data.status === 'success') {
            alert('Signed in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }

        console.log(res);
    } catch (err) {
        alert(err.response.data.message);
    }
};

form.addEventListener('submit', e => {
    // prevents the form from loding any other page.
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signIn(email, password);
});