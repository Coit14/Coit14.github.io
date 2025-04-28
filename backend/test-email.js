const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Send test email
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'coitsfte@gmail.com',
            subject: 'Test Email from Coit\'s Food Truck',
            text: 'This is a test email to verify the email service is working.'
        });

        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

testEmail(); 