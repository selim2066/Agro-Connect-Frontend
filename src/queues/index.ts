import { startEmailWorker } from './email/email.worker';
import { startSubscriptionWorker } from './subscription/subscription.worker';
import { SubscriptionJobs } from './subscription/subscription.queue';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Queue registry — start all workers and register recurring jobs
// Called once from server.ts at startup
// ─────────────────────────────────────────────────────────────────────────────

export async function startAllWorkers(): Promise<void> {
  startEmailWorker();
  startSubscriptionWorker();

  // Register the daily subscription expiry cron job
  // (BullMQ deduplicates by jobId so safe to call on every startup)
  await SubscriptionJobs.scheduleExpiryCheck();

  logger.info('All BullMQ workers started');
}

// Re-export queues and helpers for use in services
export { emailQueue, EmailJobs } from './email/email.queue';
export { subscriptionQueue, SubscriptionJobs } from './subscription/subscription.queue';
