import type { Response } from "express";
export function sendSuccess(
  code: number,
  message: string,
  response: Response,
  payload?: any
) {
  return response.status(code).json({
    status: "success",
    message,
    data: payload,
  });
}
