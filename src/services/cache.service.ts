// src/services/cache.service.ts
import redisClient, { type RedisClient } from "../config/redis.js";

export interface ICacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttlSeconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
  flush(): Promise<void>;
  getNamespacedKey(key: string): string;
}

class CacheService implements ICacheService {
  private client: RedisClient;
  private isEnabled: boolean;
  private namespace: string;

  constructor(client: RedisClient) {
    this.client = client;
    this.isEnabled =
      process.env.NODE_ENV === "production" ||
      process.env.ENABLE_REDIS === "true";
    this.namespace = process.env.REDIS_KEY_PREFIX || "syncnexa:identity:";
  }

  /**
   * Get a value from cache
   */
  async get(key: string): Promise<string | null> {
    if (!this.isEnabled) return null;

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`[CacheService] Error getting key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isEnabled) return;

    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error(`[CacheService] Error setting key "${key}":`, error);
    }
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`[CacheService] Error deleting key "${key}":`, error);
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(
        `[CacheService] Error checking existence of key "${key}":`,
        error,
      );
      return false;
    }
  }

  /**
   * Set expiration on an existing key
   */
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      return await this.client.expire(key, ttlSeconds);
    } catch (error) {
      console.error(
        `[CacheService] Error setting expiration on key "${key}":`,
        error,
      );
      return false;
    }
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    if (!this.isEnabled) return -2;

    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(
        `[CacheService] Error getting TTL for key "${key}":`,
        error,
      );
      return -2;
    }
  }

  /**
   * Flush all cache data (use with caution!)
   */
  async flush(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.client.flushall();
    } catch (error) {
      console.error("[CacheService] Error flushing cache:", error);
    }
  }

  /**
   * Get the fully namespaced key
   */
  getNamespacedKey(key: string): string {
    return `${this.namespace}${key}`;
  }

  /**
   * Get the underlying Redis client (for advanced operations)
   */
  getClient(): RedisClient | null {
    return this.isEnabled ? this.client : null;
  }
}

// Export singleton instance
const cacheService = new CacheService(redisClient);
export default cacheService;
