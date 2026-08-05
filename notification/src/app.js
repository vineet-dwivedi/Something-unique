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

channel.consume('auth_notification_queue', async (msg) => {
    if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log('Received message from auth_notification_queue:', messageContent);

        try{
            const {userId,action,timestamp,email} = JSON.parse(messageContent);

            const subject = 'New Login Notification';
            const text = `A new login was detected for your account at ${timestamp}.`
            const html = `<p>A new login detected for your account at <strong>${timestamp}</strong>.</p>`

            await sendEmail({email, subject, text, html});
            channel.ack(msg);
        } catch (error) {
            console.error('Error processing notification message:', error);
        }
    }
});

export default app;