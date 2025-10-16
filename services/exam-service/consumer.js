// classCrafters/services/exam-service/consumer.js
const amqp = require('amqplib');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// --- Configuration ---
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const USER_EXCHANGE = 'user_events';
const USER_QUEUE = 'exam_service_user_sync_queue';
const USER_ROUTING_KEY = 'user.created';

async function startUserEventConsumer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Assert the exchange
        await channel.assertExchange(USER_EXCHANGE, 'topic', { durable: true });

        // Assert the queue and bind it to the exchange with the routing key
        const { queue } = await channel.assertQueue(USER_QUEUE, { durable: true });
        await channel.bindQueue(queue, USER_EXCHANGE, USER_ROUTING_KEY);

        console.log('[ExamService] Waiting for user events...');

        channel.consume(queue, async (msg) => {
            if (msg.content) {
                try {
                    const userDetails = JSON.parse(msg.content.toString());
                    console.log(`[ExamService] Received user.created event for user ID: ${userDetails.id}`);

                    // Use Prisma to upsert the user into the local database
                    await prisma.user.upsert({
                        where: { id: userDetails.id },
                        update: {
                            email: userDetails.email,
                            name: userDetails.name,
                            role: userDetails.role
                        },
                        create: {
                            id: userDetails.id,
                            email: userDetails.email,
                            name: userDetails.name,
                            role: userDetails.role
                        }
                    });

                    console.log(`[ExamService] User ${userDetails.id} synchronized to local database.`);
                    channel.ack(msg); // Acknowledge the message to remove it from the queue
                } catch (error) {
                    console.error('[ExamService] Error processing user event:', error);
                    // Nack the message with requeue=false to prevent an infinite loop
                    channel.nack(msg, false, false); 
                }
            }
        }, { noAck: false });

    } catch (error) {
        console.error('[ExamService] Failed to start user event consumer:', error.message);
        // Implement a retry strategy
        setTimeout(startUserEventConsumer, 5000);
    }
}
