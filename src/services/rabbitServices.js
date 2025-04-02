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
};

export async function passwordRecoveryEvent(data) {
  try {
    const connection = await amqp.connect({
      protocol: 'amqps',
      hostname: process.env.RABBITMQ_URL,
      port: 5671,
      username: process.env.RABBITMQ_USER,
      password: process.env.RABBIT_PASS,
      vhost: process.env.RABBITMQ_VHOST
    });

    const channel = await connection.createChannel();

    const exchange = "user_event";
    const routingKey = "user.recover";

    await channel.assertExchange(exchange, "topic", { durable: true });

    const message = JSON.stringify({
      email: data.email,
      subject: "Recuperación de contraseña",
      body: `Hola, has solicitado recuperar tu contraseña. Si no fuiste tú, ignora este mensaje.`
    });

    channel.publish(exchange, routingKey, Buffer.from(message));
    console.log(`[x] Sent recovery to ${data.email}`);

    setTimeout(() => connection.close(), 500);
  } catch (error) {
    console.error("Error al publicar evento de recuperación:", error);
  }
}

