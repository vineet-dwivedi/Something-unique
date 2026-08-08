import express from 'express';
import morgan from 'morgan';
import { sendEmail } from './email.js';
import channel from './mq.js';

const app = express();

//Middleware
app.use(morgan('combined'))

app.get('/', (req,res)=>{
    res.status(200).json({message: 'Notification service is running!'})
});

app.get('/status/health',(req,res)=>{
    res.status(200).json({message: 'Active'})
})

app.get('/status/ready',(req,res)=>{
    res.status(200).json({message: 'Ready'})
})

if (channel) {
    channel.consume('auth_notification_queue', async (msg) => {
        if (msg !== null) {
            const messageContent = msg.content.toString();
            console.log('Received message from auth_notification_queue:', messageContent);

            try {
                const { action, timestamp, email } = JSON.parse(messageContent);

                const subject = `[Knit Dev] ${action === 'google_signup' ? 'Welcome to Knit Dev!' : 'Security Alert: New Account Login'}`;
                const text = `Hello,\n\nA new login activity (${action}) was detected for your account (${email}) at ${new Date(timestamp).toLocaleString()}.\n\nIf this was you, no action is needed.\n\nBest regards,\nKnit Dev Team`;
                const html = `
                    <div style="font-family: sans-serif; padding: 20px; color: #222;">
                        <h2 style="color: #c1452e;">Knit Dev — ${action === 'google_signup' ? 'Welcome!' : 'New Login Alert'}</h2>
                        <p>A new login activity (<strong>${action}</strong>) was detected for account <strong>${email}</strong> at <code>${new Date(timestamp).toLocaleString()}</code>.</p>
                        <p style="color: #666; font-size: 13px;">If you initiated this login, you can safely ignore this email.</p>
                    </div>
                `;

                await sendEmail({ email, subject, text, html });
                channel.ack(msg);
            } catch (error) {
                console.error('Error processing notification message:', error);
            }
        }
    });
} else {
    console.warn('Notification queue consumer inactive — RabbitMQ channel unavailable.');
}

export default app;