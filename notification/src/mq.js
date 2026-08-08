import amqplib from 'amqplib';

const QUEUE = 'auth_notification_queue';

let channel = null;

try {
  if (process.env.RABBITMQ_URL) {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log(`Notification service connected to RabbitMQ queue "${QUEUE}"`);
  }
} catch (err) {
  console.error('RabbitMQ connection error in Notification service:', err.message);
}

export default channel;