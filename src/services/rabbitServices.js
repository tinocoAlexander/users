import dotenv from 'dotenv';
import amqp from 'amqplib';

dotenv.config();

const RABBITMQ_EXCHANGE = "user_event";
const RABBITMQ_ROUTING_KEY = "user.created";

export async function userCreatedEvent(user) {
  try {
    const connection = await amqp.connect({
      protocol: 'amqps',
      hostname: process.env.RABBITMQ_URL,
      port: 5671,
      username: process.env.RABBITMQ_USER,
      password: process.env.RABBIT_PASS,
      vhost: process.env.RABBITMQ_VHOST
    })
    const channel = await connection.createChannel();

    // Declarar el Exchange
    await channel.assertExchange(RABBITMQ_EXCHANGE, "topic", { durable: true });

    // Publicar el evento
    const message = JSON.stringify(user);
    channel.publish(RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY, Buffer.from(message));

    console.log(`[x] exchange "${RABBITMQ_EXCHANGE}", ROUTING KEY "${RABBITMQ_ROUTING_KEY}": ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error al publicar evento de usuario:", error);
    throw error;
  }
}
