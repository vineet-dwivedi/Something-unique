import amqplib from 'amqplib/callback_api';

const QUEUE = 'auth_notification_queue';

const connection = amqplib.connect(process.env.RABBITMQ_URL);

const channel = await connection.createChannel();

channel.assertQueue(QUEUE, { durable: true });

export default channel;