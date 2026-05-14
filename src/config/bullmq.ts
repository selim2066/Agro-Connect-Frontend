import type { ConnectionOptions, DefaultJobOptions } from 'bullmq';
import { env } from './env';

// ─────────────────────────────────────────────────────────────────────────────
// BullMQ reuses the same Redis connection as the rest of the app.
// ─────────────────────────────────────────────────────────────────────────────

export const bullmqConnection: ConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
};

// ─────────────────────────────────────────────────────────────────────────────
// Default job options applied to every queue unless overridden.
// Per backend-rules: always handle job failure gracefully with retries.
// ─────────────────────────────────────────────────────────────────────────────

export const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000, // 5s → 10s → 20s
  },
  removeOnComplete: { count: 100 }, // keep last 100 completed jobs
  removeOnFail: { count: 500 },     // keep last 500 failed jobs for inspection
};
