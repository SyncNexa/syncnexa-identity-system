import express from "express";
import compression from "compression";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import indexRoutes from "./routes/index.route.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import appsRoutes from "./routes/apps.route.js";
import sauthRoutes from "./routes/sauth.route.js";

const app = express();

app.set("trust proxy", true);

app.use(helmet());
app.use(compression());
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRoutes);

app.use("/api", apiLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/apps", appsRoutes);
app.use("/api/v1/sauth", sauthRoutes);

app.use(errorHandler);

export default app;
