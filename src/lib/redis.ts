import Redis from 'ioredis';
import { redisOptions } from '../config/redis';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Redis singleton
//
// Rules from backend-rules.md:
//  - Use try/catch around Redis calls (never crash if Redis is down)
//  - Always set TTL on every cache key
//  - Invalidate cache on relevant data mutation
// ─────────────────────────────────────────────────────────────────────────────

export const redis = new Redis(redisOptions);

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('ready', () => {
  logger.info('Redis ready');
});

redis.on('error', (err: Error) => {
  // Warn but never crash — per backend-rules.md
  logger.warn(`Redis error: ${err.message}`);
});

redis.on('close', () => {
  // Only log if we were previously connected to avoid boot noise
  if (redis.status === 'ready') {
    logger.warn('Redis connection closed');
  }
});

// Reconnection logging removed to reduce terminal noise during development

// ─────────────────────────────────────────────────────────────────────────────
// Safe cache helpers — always wrapped in try/catch
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a cached value. Returns null on any error (Redis down, parse fail, etc.)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    logger.warn(`Cache GET failed for key: ${key}`);
    return null;
  }
}

/**
 * Set a cached value with TTL. Silently fails if Redis is down.
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    logger.warn(`Cache SET failed for key: ${key}`);
  }
}

/**
 * Delete a cache key. Silently fails if Redis is down.
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    logger.warn(`Cache DEL failed for key: ${key}`);
  }
}

/**
 * Delete all keys matching a pattern (uses SCAN to avoid blocking).
 * Use for feed cache invalidation.
 */
export async function deleteCacheByPattern(pattern: string): Promise<void> {
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== '0');
  } catch {
    logger.warn(`Cache pattern DEL failed for pattern: ${pattern}`);
  }
}
