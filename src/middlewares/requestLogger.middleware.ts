import morgan from "morgan";
import geoip from "geoip-lite";
import type { Request, Response } from "express";
import { logger } from "../utils/logger.js";

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
      fallback: T,
    ): T => (typeof fn === "function" ? fn(req, res) : fallback);

    const method = get(tokens.method, "UNKNOWN");
    const url = get(tokens.url, "UNKNOWN");
    const status = Number(get(tokens.status, "0"));

    const responseTime = Number(get(tokens["response-time"], "0"));
    const contentLength = Number(
      tokens.res?.(req, res, "content-length") || "0",
    );
    const requestIdHeader =
      req.headers["x-request-id"] || req.headers["x-correlation-id"];
    const requestId = Array.isArray(requestIdHeader)
      ? requestIdHeader[0]
      : requestIdHeader || null;

    logger.info("HTTP request", {
      method,
      url,
      status,
      responseTimeMs: responseTime,
      ip,
      geo,
      userAgent: req.headers["user-agent"] || "unknown",
      contentLength,
      requestId,
    });

    return "";
  },
  {
    stream: {
      write: () => {
        // Intentionally no-op. Structured logs are emitted via logger.info above.
      },
    },
  },
);
