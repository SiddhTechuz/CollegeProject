const nodemailer = require('nodemailer');
const pug = require('pug')
const htmlToText = require('html-to-text')
module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firsName = user.name.split(' ')[0];
        this.url = url;
        this.from = 'FixIt Friend <admin@fixItFriend.io>'
    }

    newTransport() {
        console.log(process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD);
        if (process.env.NODE_ENV === 'production') {
            console.log('inside production');
            return 1
        }
        else {
            return nodemailer.createTransport({
                host: "sandbox.smtp.mailtrap.io",
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                },
                tls: {
                    ciphers: 'SSLv3'
                }
            })
        }
    }
    async send(template, subject) {
        //1 render  html based on templates
        console.log('inside send classs');
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firsName: this.firsName,
            url: this.url,
            subject
        });
        console.log('inside send class 2');
        //2 Defineemail options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html)
            //html
        }
        //3 create a transport and send emaill

        await this.newTransport().sendMail(mailOptions)
        console.log('mail sent');
    }
    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family')
    }
    async sendReminder(taskName, taskType, taskDate) {
        console.log('inside reminder classs');
        const html = pug.renderFile(`${__dirname}/../views/email/reminder.pug`, {
            taskName: this.firsName,
            taskType,
            taskDate
        });

        const mailOptions = {
            from: this.from,
            to: 'hello@example.com',
            subject: "Reminder for Task",
            html,
            text: htmlToText.convert(html)
            //html
        }
        await this.newTransport().sendMail(mailOptions)
        console.log('mail sent');
    }
    async sendPasswordReset() {
        console.log('inside password reset email');
        console.log(await this.send('passwordReset', 'Your password reset token valid for 10 minutes'));
        await this.send('passwordReset', 'Your password reset token valid for 10 minutes')
    }
}
