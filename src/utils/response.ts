import type { Response } from "express";

/**
 * Send a standardized success JSON response.
 *
 * @param {number} code - HTTP status code (typically 2xx).
 * @param {string} message - Human readable message describing the result.
 * @param {Response} response - Express `Response` object to send the reply.
 * @param {*} [payload] - Optional payload (data) to include in the response body.
 * @returns {Response} The Express response returned by `response.json()`.
 */
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

/**
 * Send a standardized error JSON response.
 *
 * @param {Response} response - Express `Response` object to send the reply.
 * @param {number} [code=404] - HTTP status code (4xx or 5xx).
 * @param {Object} [options] - Additional options for the error response.
 * @param {string} [options.message='Resource not found'] - Human readable error message.
 * @param {*} [options.payload] - Optional additional error data to include.
 * @returns {Response} The Express response returned by `response.json()`.
 */
export function sendError(
  response: Response,
  code: number = 404,
  {
    message = "Resource not found",
    payload,
  }: { message: string; payload?: any }
) {
  return response
    .status(code)
    .json({ status: "failed", message, data: payload });
}
