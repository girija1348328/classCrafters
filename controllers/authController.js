const amqp = require('amqplib');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// --- Configuration ---
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const USER_EXCHANGE = 'user_events';
const JWT_SECRET = process.env.JWT_SECRET || "a_secret_12345";
const JWT_EXPIRES_IN = "7d";

let channel;

/**
 * Initializes the RabbitMQ connection and asserts the exchange.
 */
// async function initRabbitMQ() {
//     try {
//         const connection = await amqp.connect(RABBITMQ_URL);
//         channel = await connection.createChannel();
//         // Assert the exchange as a 'topic' exchange, which the exam-service is bound to
//         await channel.assertExchange(USER_EXCHANGE, 'topic', { durable: true });
//         console.log('[UserService] RabbitMQ Publisher connected and exchange asserted.');
//     } catch (error) {
//         console.error('[UserService] Failed to initialize RabbitMQ:', error.message);
//         // Implement robust retry logic here in a production environment
//         setTimeout(initRabbitMQ, 5000);
//     }
// }

// Initialize RabbitMQ when the user service starts
// initRabbitMQ();


const generateToken = (user) => {
    // Note: 'role' here is the role name (e.g., 'student', 'teacher')
    console.log('[UserService] Generating token for user:', user); // Debugging line to check user object
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};



// function publishUserEvent(type, data) {
//     if (!channel) {
//         console.error('[UserService] RabbitMQ channel not initialized. Cannot publish event.');
//         return;
//     }

//     const routingKey = `user.${type}`;
//     const message = Buffer.from(JSON.stringify(data));

//     channel.publish(
//         USER_EXCHANGE,
//         routingKey,
//         message,
//         { persistent: true } // Message survives broker restart
//     );
//     console.log(`[UserService] Published event: ${routingKey} for User ID: ${data.id}`);
// }

exports.signup = async (req, res) => {
    try {
        const { name, email, password_hash, role_id } = req.body;

        // --- Validation ---
        if (!name || !email || !password_hash || !role_id) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password_hash, 10);

        // Save to DB
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password_hash: hashedPassword,
                role: { connect: { id: role_id } }
            },
            include: { role: true }
        });

        const userPayload = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role.name
        };

        // Publish event
        // publishUserEvent('created', userPayload);

        // Generate token
        const token = generateToken(userPayload);

        // --- SEND RESPONSE ---
        res.status(201).json({ user: userPayload, token });

    } catch (err) {
        console.error("[UserService] Signup Error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Placeholder for login function (Assuming it is handled in a separate service function)
exports.login = async (req, res) => {
    try {
        const { email, password_hash } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });

        if (!user) {
            // It's a best practice to return a generic error message for both wrong email and password attempts
            // to prevent leaking information about which accounts exist.
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password_hash, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const userPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role.name
        };

        const token = generateToken(userPayload);

        // --- SEND RESPONSE ---
        // This is the critical step that was missing.
        // On successful login, send a 200 OK status with the user data and JWT.
        res.status(200).json({ user: userPayload, token });

    } catch (err) {
        console.error("[UserService] Login Error:", err.message);
        // Catch any unexpected errors (e.g., database connection issues) and send a 500 status.
        res.status(500).json({ error: "Internal server error" });
    }
};
