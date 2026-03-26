import path from "path";
import fs from "fs";
import winston from "winston";
import "winston-daily-rotate-file";
import { cwd } from "process";
import os from "os";

const logDir = path.resolve(cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const service = process.env.SERVICE_NAME || "identity";
const environment = process.env.NODE_ENV || "development";

const severityMap: Record<string, string> = {
  error: "ERROR",
  warn: "WARNING",
  info: "INFO",
  http: "INFO",
  verbose: "DEBUG",
  debug: "DEBUG",
  silly: "DEBUG",
};

const compactJsonFormat = winston.format((info) => {
  info.severity = severityMap[info.level] || info.level.toUpperCase();
  info.service = service;
  info.environment = environment;
  info.pid = process.pid;
  info.host = os.hostname();
  return info;
});

const prettyConsoleFormat = winston.format.printf((info) =>
  JSON.stringify(info, null, 2),
);

// Daily rotate log files
const transport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
});

// Separate error log file
const errorTransport = new winston.transports.File({
  filename: path.join(logDir, "error.log"),
  level: "error",
});

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    compactJsonFormat(),
    winston.format.json(),
  ),
  transports: [transport, errorTransport],
});

// Mirror structured logs to console by default for container/stdout observability.
if (process.env.LOG_TO_CONSOLE !== "false") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        compactJsonFormat(),
        prettyConsoleFormat,
      ),
    }),
  );
}
