import pino from 'pino';
import { env } from './env.config.js';

const isDevelopment = env.NODE_ENV === 'development';

const logger = pino({
    level: env.NODE_ENV === "production" ? "info" : "debug",
    transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
    base: {
        app: "notes-api",
        env: env.NODE_ENV,
    },
    redact: {
        paths: ['req.headers.authorization', 'password', 'passwordHash', '*.password', '*.passwordHash', '*.token', 'token', 'req.headers.cookie', 'cookie', 'req.headers.set-cookie', 'set-cookie'],
        censor: '[REDACTED]',
    },
});

export default logger;