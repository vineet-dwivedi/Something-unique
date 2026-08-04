import nodemailer from 'nodemailer';

// Create a transporter using Gmail and OAuth2 authentication
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
})

// Verify the transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error configuring email transporter:', error);
    } else {
        console.log('Email transporter is ready to send messages');
    }
});

// Function to send an email
export async function sendEmail(to, subject, text, html){
    try{
        const info = await transporter.sendMail({
            from: `Your Name <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log('Email sent:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (error){
        console.error('Error sending email:', error);
    }
};