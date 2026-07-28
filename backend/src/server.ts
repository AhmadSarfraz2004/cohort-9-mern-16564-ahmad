import app from "./app.js";
import { env } from "./config/env.config.js";
import logger from "./config/logger.config.js";

const port = Number(env.PORT);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error("Invalid PORT environment variable.");
}

app.listen(port, () => {
    logger.info(`🚀 Server is running on http://localhost:${port}`);
});