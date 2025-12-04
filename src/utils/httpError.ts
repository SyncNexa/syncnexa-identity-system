export class HttpError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    Error.captureStackTrace?.(this, HttpError);
  }
}

export function badRequest(message = "Bad Request") {
  return new HttpError(400, message);
}

export function unauthorized(message = "Unauthorized") {
  return new HttpError(401, message);
}

export function notFound(message = "Not Found") {
  return new HttpError(404, message);
}

export function internalError(message = "Internal Server Error") {
  return new HttpError(500, message);
}

export default HttpError;
