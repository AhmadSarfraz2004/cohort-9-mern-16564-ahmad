import express from "express";
import cors from "cors";
import helmet from "helmet";

import routes from "./routes/routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/api", routes);

export default app;