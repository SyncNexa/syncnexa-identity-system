import type { Response } from "express";

export function sendError(code: number, message: string, response: Response) {
  return response.status(code).json({
    status: "failed",
    message,
    data: null,
  });
}
