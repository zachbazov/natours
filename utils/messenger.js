const nodemailer = require('nodemailer');

// Send email via Nodemailer.
const Messenger = async options => {
    // Create a transporter.
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    // Define the email options.
    const mOptions = {
        from: 'Zach Bazov <zachbazov@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html: options.html
    };
    // Send the email.
    await transporter.sendMail(mOptions);
};

module.exports = Messenger;