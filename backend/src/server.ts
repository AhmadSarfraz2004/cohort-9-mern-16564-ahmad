import app from "./app.js";
import { connectDB, disconnectDB } from "./config/database.config.js";
import { env } from "./config/env.config.js";
import logger from "./config/logger.config.js";

const port = Number(env.PORT);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("Invalid PORT environment variable.");
}

const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        const server = app.listen(port, () => {
            logger.info(`🚀 Server is running on http://localhost:${port}`);
        });

        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received. Shutting down gracefully...`);

            server.close(async () => {
                await disconnectDB();
                logger.info("HTTP server closed.");
                process.exit(0);
            });
        };

        process.on("SIGINT", () => {
            void gracefulShutdown("SIGINT");
        });

        process.on("SIGTERM", () => {
            void gracefulShutdown("SIGTERM");
        });

    } catch (error) {
        logger.fatal({ error }, "Failed to start server");
        process.exit(1);
    }
};

void startServer();