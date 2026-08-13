import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import routes from "./routes/routes.js";
import { notFoundHandler } from "./common/middleware/notFound.middleware.js";
import { errorHandler } from "./common/middleware/error.middleware.js";
import { requestLogger } from "./common/middleware/requestLogger.middleware.js";
import { env } from "./config/env.config.js";

const app = express();

app.use(requestLogger);

app.use(helmet());

app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api", routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;