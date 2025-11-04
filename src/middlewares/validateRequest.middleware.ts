import type { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

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
        return res.status(400).json({
          status: "failed",
          message: "Validation error",
          errors: err.issues,
        });
      }

      next(err);
    }
  };
