const nodemailer = require('nodemailer')//send emails (npm i nodemailer)
const pug = require('pug')
const htmlToText = require('html-to-text')

// new Email(user, url).sendWelcome()
module.exports = class Email {
    constructor(user, url){
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url
        this.from = `Jamar Andrade <${process.env.EMAIL_FROM}>`
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            //Sendgrid
            return nodemailer.createTransport({
                // service: 'sendGrid',
                // auth: {
                //     user: process.env.SENDGRID_USERNAME,
                //     pass: process.env.SENDGRID_PASSWORD
                // }
                service: 'SendinBlue',
                auth: {
                       user: 'jandrade2018@fau.edu',
                       pass: 'xsmtpsib-b79cd4b1f520b8d590988d90b6a64f80f44dae51be48a26f0f35ec6d94b4567a-94KcfSOYqaBQdsMR'
                   }
            })

        }

        return nodemailer.createTransport({
            // 1) Create a transporter - service that sends the email
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    async send(template, subject){
        //send the actual email
        // 1) Render html based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstname: this.firstName,
            url: this.url,
            subject
        })

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions)
    }

    async sendWelcome(){  
        await this.send('welcome', 'Welcome to the Natours Family!')//takes in template name and some subject
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)')
    }
}

