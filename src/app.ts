import express from "express";
import compression from "compression";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import indexRoutes from "./routes/index.route.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import authRoutes from "./routes/auth.route.js";

const app = express();

app.set("trust proxy", true);

app.use(helmet());
app.use(compression());
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRoutes);

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;
