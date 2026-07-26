import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/routes.js";
import { notFoundHandler } from "./common/middleware/notFound.middleware.js";
import { errorHandler } from "./common/middleware/error.middleware.js";
import { requestLogger } from "./common/middleware/requestLogger.middleware.js";

const app = express();

app.use(requestLogger);

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;