// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import type { Request, Response, NextFunction } from "express";
import cacheService from "../services/cache.service.js";

const isProd = process.env.NODE_ENV === "production";
const isRedisEnabled = isProd || process.env.ENABLE_REDIS === "true";
const redisClient = cacheService.getClient();

// Temporary IP ban memory store
const bannedIPs = new Map<string, number>();

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,

  skip: (req: Request) => {
    const ip = req.ip ?? ""; // fallback to empty string if undefined
    const banExpires = bannedIPs.get(ip);

    if (banExpires && Date.now() < banExpires) return true; // skip if banned
    if (banExpires && Date.now() > banExpires) bannedIPs.delete(ip);

    return false;
  },

  handler: (req: Request, res: Response, _next: NextFunction, options) => {
    const ip = req.ip ?? "unknown"; // <-- safe fallback
    const strikes = bannedIPs.get(ip) || 0;
    const banDuration = 30 * 60 * 1000; // 30 mins

    if (strikes >= 6) {
      bannedIPs.set(ip, Date.now() + banDuration);
      return res.status(429).json({
        success: false,
        message:
          "Your IP has been temporarily banned due to excessive requests.",
      });
    }

    bannedIPs.set(ip, strikes + 1);

    return res.status(options.statusCode ?? 429).json(
      options.message ?? {
        success: false,
        message: "Too many requests, please slow down.",
      },
    );
  },

  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },

  ...(isRedisEnabled && redisClient
    ? {
        store: new RedisStore({
          sendCommand: (...args: string[]) => redisClient.call(...args),
        }),
      }
    : {}),
});
