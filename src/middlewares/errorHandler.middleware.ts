import type { Request, Response, NextFunction } from "express";
import chalk from "chalk";
import { logger } from "../utils/logger.js";

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
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.ip ||
    "unknown";

  const route = `${req.method} ${req.originalUrl}`;
  const message = err.message || "Unknown error";
  const stack = err.stack || "No stack trace";

  console.error(
    [
      chalk.red.bold("🔥 SERVER ERROR 🔥"),
      chalk.redBright(`Route: ${route}`),
      chalk.yellow(`IP: ${ip}`),
      chalk.red(`Message: ${message}`),
      chalk.gray(stack),
      "\n",
    ].join("\n")
  );

  // 📝 File log for production / audits
  logger.error(`Error from ${route} - IP: ${ip} - ${message}\n${stack}`);

  // Generic response for users
  res.status(500).json({
    success: "failed",
    message: "Internal Server Error",
  });
}
