import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { sendError } from "../utils/error.js";
import { DuplicateEmailError } from "../models/user.model.js";

// export function errorHandler(
//   err: any,
//   _req: Request,
//   res: Response,
//   _next: NextFunction
// ) {
//   console.error("❌ Error:", err);

//   const status = err.status || 500;
//   const message = err.message || "Internal Server Error";

//   res.status(status).json({
//     status: "failed",
//     message,
//     ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
//     data: null,
//   });
// }

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.ip ||
    "unknown";

  const route = `${req.method} ${req.originalUrl}`;
  const message = err.message || "Unknown error";

  logger.error("Unhandled application error", {
    route,
    ip,
    message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
    userAgent: req.headers["user-agent"] || "unknown",
    requestId:
      req.headers["x-request-id"] || req.headers["x-correlation-id"] || null,
  });

  // Handle specific error types
  if (err instanceof DuplicateEmailError) {
    return sendError(409, err.message, res);
  }

  // Generic response for users
  // Infer a more accurate HTTP status code when possible
  let status = 500;
  const msg = message.toString();
  const lower = msg.toLowerCase();

  if (typeof err?.status === "number") {
    status = err.status;
  } else if (
    lower.includes("unauthorized") ||
    lower.includes("invalid token") ||
    lower.includes("invalid credentials")
  ) {
    status = 401;
  } else if (
    lower.includes("not found") ||
    lower.includes("does not exist") ||
    lower.includes("not exist")
  ) {
    status = 404;
  } else if (
    lower.includes("missing") ||
    lower.includes("required") ||
    lower.includes("bad request")
  ) {
    status = 400;
  }

  // Use sendError helper for a consistent response shape
  return sendError(status, msg, res);
}
