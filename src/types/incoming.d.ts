declare module "http" {
  interface IncomingMessage {
    rawBody?: string;
  }
}

declare namespace Express {
  interface Request {
    rawBody?: string;
  }
}
