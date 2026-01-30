import express from "express";
import compression from "compression";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import indexRoutes from "./routes/index.route.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import appsRoutes from "./routes/apps.route.js";
import sauthRoutes from "./routes/sauth.route.js";
import securityRoutes from "./routes/security.route.js";
import { markdownToHtml, getDocPath } from "./utils/docsServer.js";
import { initializeVerificationForExistingStudents } from "./services/verificationInitializer.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy", true);

app.use(helmet());
app.use(compression());
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve developer docs (markdown → HTML) locally; disable with ENABLE_LOCAL_DOCS=false
const enableDocs = process.env.ENABLE_LOCAL_DOCS !== "false";
if (enableDocs) {
  const docsDir = path.resolve(__dirname, "../docs");

  // Route to serve markdown docs as HTML with sidebar navigation
  app.get(/^\/docs(?:\/(.+))?$/, async (req, res, next) => {
    try {
      const docPath = req.params[0] || "getting-started/overview";
      const filePath = getDocPath(docPath, docsDir);

      // Check if file exists before converting
      const fs = await import("fs");
      if (!fs.existsSync(filePath)) {
        return res.status(404).send("<h1>404 - Documentation not found</h1>");
      }

      const html = await markdownToHtml(filePath, docsDir, `/${docPath}`);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err) {
      next(err);
    }
  });
}

app.use("/", indexRoutes);

app.use("/api", apiLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/apps", appsRoutes);
app.use("/api/v1/sauth", sauthRoutes);
app.use("/api/v1/security", securityRoutes);

app.use(errorHandler);

// Initialize verification pillars for existing students (non-blocking)
initializeVerificationForExistingStudents().catch((err) => {
  console.error(
    "[VERIFICATION] Failed to initialize verification on startup:",
    err,
  );
});

export default app;
