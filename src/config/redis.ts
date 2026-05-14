import type { RedisOptions } from 'ioredis';
import { env } from './env';

// ─────────────────────────────────────────────────────────────────────────────
// Connection options
// ─────────────────────────────────────────────────────────────────────────────

export const redisOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  lazyConnect: true, // connect only when first command is issued
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 10) return null; // stop retrying after 10 attempts
    return Math.min(times * 500, 5000); // exponential backoff, cap 5s
  },
  enableReadyCheck: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// TTL constants (in seconds) — per backend-architecture.md
// ─────────────────────────────────────────────────────────────────────────────

export const CACHE_TTL = {
  PRODUCT_FEED: 300,        // 5 min
  SHOP_FEED: 300,           // 5 min
  PRODUCT_SINGLE: 600,      // 10 min
  SHOP_SINGLE: 600,         // 10 min
  CATEGORY: 3600,           // 1 hour
  AI_RECOMMENDATION: 900,   // 15 min
} as const;
