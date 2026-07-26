import app from "./app.js";
import { connectDB, disconnectDB } from "./config/database.config.js";
import { env } from "./config/env.config.js";
import logger from "./config/logger.config.js";
import { createServer } from "node:http";

const port = Number(env.PORT);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("Invalid PORT environment variable.");
}

const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        const server = createServer(app);

        server.listen(port, () => {
            logger.info(`🚀 Server is running on http://localhost:${port}`);
        });

        server.on("error", (err) => {
            logger.fatal({ err }, "Failed to start HTTP server");
            process.exit(1);
        });

        const gracefulShutdown = async (signal: string): Promise<void> => {
            logger.info(`${signal} received. Shutting down gracefully...`);

            try {
                await new Promise<void>((resolve, reject) => {
                    server.close((err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });

                logger.info("HTTP server closed.");

                await disconnectDB();

                logger.info("MongoDB disconnected.");
                process.exit(0);
            } catch (err) {
                logger.error({ err }, "Graceful shutdown failed");
                process.exit(1);
            }
        };

        process.on("SIGINT", () => {
            void gracefulShutdown("SIGINT");
        });

        process.on("SIGTERM", () => {
            void gracefulShutdown("SIGTERM");
        });

    } catch (error) {
        logger.fatal({ error }, "Failed to start application");
        process.exit(1);
    }
};

void startServer();