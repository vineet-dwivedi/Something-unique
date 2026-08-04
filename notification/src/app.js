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

channel.consume('auth_notification_queue', async (msg) => {
    if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log('Received message from auth_notification_queue:', messageContent);

        try{
            const {to, subject, text, html} = JSON.parse(messageContent);
            await sendEmail({to, subject, text, html});
            channel.ack(msg);
        } catch (error) {
            console.error('Error processing notification message:', error);
        }
    }
});

export default app;