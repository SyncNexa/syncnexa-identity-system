import "./config/env.js";
import app from "./app.js";
import http from "http";
import { logger } from "./utils/logger.js";

const PORT = Number(process.env.PORT);

const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  logger.info("server_started", {
    port: PORT,
    host: "0.0.0.0",
  });
});
