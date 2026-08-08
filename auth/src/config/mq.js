import amqplib from 'amqplib';

const QUEUE = 'auth_notification_queue';
let channel = null;

async function getChannel() {
  if (channel) return channel;
  if (!process.env.RABBITMQ_URL) return null;
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    return channel;
  } catch (err) {
    console.warn('RabbitMQ connection warning in Auth service:', err.message);
    return null;
  }
}

export async function sendAuthNotification(message) {
  try {
    const ch = await getChannel();
    if (ch) {
      ch.sendToQueue(
        QUEUE,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    }
  } catch (err) {
    console.warn('Failed to send auth notification to queue:', err.message);
  }
}