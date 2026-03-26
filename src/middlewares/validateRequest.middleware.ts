import type { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { logger } from "../utils/logger.js";

export const validateRequest =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const requestIdHeader =
          req.headers["x-request-id"] || req.headers["x-correlation-id"];
        const requestId = Array.isArray(requestIdHeader)
          ? requestIdHeader[0]
          : requestIdHeader || null;
        const forwarded = req.headers["x-forwarded-for"];
        const ip =
          (Array.isArray(forwarded)
            ? forwarded[0]
            : typeof forwarded === "string"
              ? forwarded.split(",")[0]
              : req.ip) || "unknown";

        logger.warn("Request validation failed", {
          method: req.method,
          path: req.originalUrl,
          ip,
          requestId,
          issues: err.issues.map((issue) => ({
            code: issue.code,
            path: issue.path.join("."),
            message: issue.message,
          })),
          bodyKeys:
            req.body && typeof req.body === "object"
              ? Object.keys(req.body)
              : [],
          queryKeys:
            req.query && typeof req.query === "object"
              ? Object.keys(req.query)
              : [],
          paramKeys:
            req.params && typeof req.params === "object"
              ? Object.keys(req.params)
              : [],
        });

        return res.status(400).json({
          status: "failed",
          message: "Validation error",
          errors: err.issues,
        });
      }

      next(err);
    }
  };
