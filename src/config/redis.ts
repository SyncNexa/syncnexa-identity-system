import IORedis from "ioredis";
import "./env.js"; // Ensure environment variables are loaded

// Use the default export which is the Redis class
const Redis = (IORedis as any).default || IORedis;
type RedisClient = InstanceType<typeof Redis>;

const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";
const isRedisEnabled = isProd || process.env.ENABLE_REDIS === "true";

let redisClient: RedisClient;

if (isRedisEnabled) {
  const keyPrefix = process.env.REDIS_KEY_PREFIX || "syncnexa:identity:";

  // Support both REDIS_URL and individual REDIS_HOST/PORT/PASSWORD
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    // Use connection string if provided
    redisClient = new Redis(redisUrl, {
      keyPrefix,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    }) as RedisClient;
  } else {
    // Use individual connection parameters
    const host = process.env.REDIS_HOST || "localhost";
    const port = parseInt(process.env.REDIS_PORT || "6379", 10);
    const password = process.env.REDIS_PASSWORD;

    redisClient = new Redis({
      host,
      port,
      password: password || undefined,
      keyPrefix,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    }) as RedisClient;
  }

  redisClient.on("error", (err: Error) =>
    console.error("[Redis] Connection Error:", err),
  );
  redisClient.on("connect", () =>
    console.log("[Redis] Connected successfully"),
  );
  redisClient.on("reconnecting", () => console.log("[Redis] Reconnecting..."));
  redisClient.on("ready", () => console.log("[Redis] Client ready"));
} else {
  // Create a mock client for development
  redisClient = {
    get: async () => null,
    set: async () => "OK",
    setex: async () => "OK",
    del: async () => 0,
    exists: async () => 0,
    expire: async () => 0,
    ttl: async () => -2,
    flushall: async () => "OK",
    disconnect: async () => {},
    quit: async () => "OK",
    status: "end",
    call: async () => null,
  } as any;

  console.log("[Redis] Running in development mode without Redis");
}

export default redisClient;
export type { RedisClient };
