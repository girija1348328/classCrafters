// src/logger.js
const pino = require('pino');

// Define the transport configuration based on the environment
const transport =
    process.env.NODE_ENV === 'development'
        ? {
            // Use pino-pretty for human-readable output in development
            target: 'pino-pretty',
            options: {
                colorize: true, // Colorize log levels
                translateTime: 'SYS:dd-mm-yyyy HH:MM:ss', // Readable timestamp
                ignore: 'pid,hostname', // Remove less useful fields from dev output
            },
        }
        : {
            // In production, logs will be raw JSON, which is ideal for log aggregators
            target: 'pino/file', // You can also use pino.destination(1) for stdout
            options: {
                destination: process.stdout.fd, // Log to stdout (standard out)
            },
        };

const logger = pino({
    // Use 'debug' level for development, 'info' for production
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',

    // Base properties to include in every log record
    base: {
        env: process.env.NODE_ENV,
        appVersion: process.env.npm_package_version, // Assuming you have a version in package.json
    },

    // Configure transports
    transport: transport,
});

module.exports = logger;
