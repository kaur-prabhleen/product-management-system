import amqp from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

let connection;
let channel;

export async function getChannel() {
  if (channel) return channel;
  const url = process.env.RABBITMQ_URL || 'amqp://localhost';
  try {
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    await channel.assertQueue('product_import', { durable: true });
    return channel;
  } catch (err) {
    throw err;
  }
}

export async function publishToQueue(message) {
  try {
    const ch = await getChannel();
    const ok = ch.sendToQueue('product_import', Buffer.from(JSON.stringify(message)), { persistent: true });
    return ok;
  } catch (err) {
    throw err;
  }
}
