import nodemailer from 'nodemailer';

// Create a transporter using Gmail and OAuth2 authentication
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: (process.env.EMAIL_USER || '').trim(),
        clientId: (process.env.GOOGLE_CLIENT_ID || '').trim(),
        clientSecret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(),
        refreshToken: (process.env.GOOGLE_REFRESH_TOKEN || '').trim()
    }
});

// Verify transporter configuration
transporter.verify((error) => {
    if (error) {
        console.error('Error configuring email transporter:', error);
    } else {
        console.log('Email transporter is ready to send messages');
    }
});

/**
 * Function to send an email
 * Supports object syntax ({ to, email, subject, text, html }) or positional syntax (to, subject, text, html)
 */
export async function sendEmail(toOrOptions, subject, text, html) {
    let recipient, mailSubject, mailText, mailHtml;

    if (typeof toOrOptions === 'object' && toOrOptions !== null) {
        recipient = toOrOptions.to || toOrOptions.email;
        mailSubject = toOrOptions.subject;
        mailText = toOrOptions.text;
        mailHtml = toOrOptions.html;
    } else {
        recipient = toOrOptions;
        mailSubject = subject;
        mailText = text;
        mailHtml = html;
    }

    if (!recipient) {
        console.error('Email error: No recipient specified');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `Knit Dev <${process.env.EMAIL_USER}>`,
            to: recipient,
            subject: mailSubject,
            text: mailText,
            html: mailHtml
        });
        console.log('Email sent successfully to', recipient, 'Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email to', recipient, ':', error);
        throw error;
    }
}