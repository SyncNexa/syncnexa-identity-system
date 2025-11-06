import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/error.js";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ message: "Missing or invalid token" });

    const token = authHeader.split(" ")[1];
    if (!token) {
      return sendError(401, "Invalid token", res);
    }
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;

    req.user = decoded as unknown as User | Student | Developer | Staff;
    req.authRole = decoded.role;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
