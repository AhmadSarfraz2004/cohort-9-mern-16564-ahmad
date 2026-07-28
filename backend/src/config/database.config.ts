import mongoose from 'mongoose';
import { env } from './env.config.js';
import logger from './logger.config.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectDB = async (retryCount = 0): Promise<void> => {
    try {
        await mongoose.connect(env.MONGODB_URL);

        logger.info('MongoDB connected successfully');

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected. Attempting to reconnect...');
            connectDB();
        });

        mongoose.connection.on('error', (err) => {
            logger.error({ err }, 'MongoDB connection error');
        });

    } catch (error) {
        logger.error({ error }, `MongoDB connection failed (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        if (retryCount < MAX_RETRIES) {
            setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY_MS);
        } else {
            logger.error('Max retries reached. Exiting process.');
            process.exit(1);
        }
    }
};

export const disconnectDB = async (): Promise<void> => {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully');
};