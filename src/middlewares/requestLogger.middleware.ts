import morgan from "morgan";
import chalk from "chalk";
import geoip from "geoip-lite";
import type { Request, Response } from "express";
import { logger } from "../utils/logger.js";

const colorizeStatus = (status: number) => {
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  if (status >= 200) return chalk.green(status);
  return chalk.white(status);
};

export const requestLogger = morgan<Request, Response>(
  (tokens, req, res): string => {
    // Safely extract forwarded IP
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      (Array.isArray(forwarded)
        ? forwarded[0]
        : typeof forwarded === "string"
        ? forwarded.split(",")[0]
        : req.ip) || "unknown";

    // Geo lookup
    const location = geoip.lookup(ip);
    const geo = location
      ? `${location.city ?? "Unknown City"}, ${
          location.country ?? "Unknown Country"
        }`
      : "Unknown Location";

    // ✅ Safe token getters
    const get = <T>(
      fn: ((req: Request, res: Response) => T) | undefined,
      fallback: T
    ): T => (typeof fn === "function" ? fn(req, res) : fallback);

    const method = get(tokens.method, "UNKNOWN");
    const url = get(tokens.url, "UNKNOWN");
    const status = Number(get(tokens.status, "0"));

    const responseTime = get(tokens["response-time"], "0");

    // 🎨 Rich colored console log
    const output = [
      chalk.gray(get(tokens.date, new Date().toISOString())),
      chalk.blue(method),
      chalk.white(url),
      colorizeStatus(status),
      chalk.magenta(`${responseTime} ms`),
      chalk.yellow(`IP: ${ip}`),
      chalk.cyan(`(${geo})`),
    ].join(" ");

    console.log(output);

    // 🗂 Structured log file
    logger.info(
      `${method} ${url} ${status} ${responseTime}ms - IP: ${ip} - Location: ${geo}`
    );

    return "";
  }
);
