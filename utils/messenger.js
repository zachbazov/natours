const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

// Advanced Emails.
// This class creates email objects that we can then use to send actual emails.
module.exports = class Messenger {
    // To create a new email object, we'll pass a user and url parameters,
    // that we'll use in the actual email.
    constructor(user, url) {
        this.to = user.email;
        this.firstname = user.name.split(' ')[0];
        this.url = url;
        this.from = `Zach Bazov <${process.env.EMAIL_FROM}>`;
    };

    // Creates different transports for different environments.
    createNewTransport() {
        // Production
        // Creates a SendGrid transporter.
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USER,
                    pass: process.env.SENDGRID_PASS
                }
            });
        }

        // Development
        // Creates a Nodemailer transporter.
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    };

    async send(template, subject) {
        // Renders the HTML for the email based on a pug template.
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstname: this.firstname,
            url: this.url,
            subject: this.subject
        });

        // Defines the email options.
        const options = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText(html)
        };

        // Creates a transport, and sends an email.
        await this.createNewTransport().sendMail(options);
    };

    // Customized sender function.
    async sendWelcome() {
        await this.send('Welcome', 'Welcome to the Natours family!');
    };

    async sendPasswordReset() {
        await this.send('reset-password', 'Your password reset token.');
    };
};

// Send email via Nodemailer.
// const Messenger = async options => {
//     // Create a transporter.
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         }
//     });
//     Define the email options.
//     const mOptions = {
//         from: 'Zach Bazov <zachbazov@gmail.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//         //html: options.html
//     };
//     Send the email.
//     await transporter.sendMail(mOptions);
// };

//module.exports = Messenger;