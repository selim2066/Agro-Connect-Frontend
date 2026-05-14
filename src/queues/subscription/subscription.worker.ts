import { Worker } from 'bullmq';
import { bullmqConnection } from '../../config/bullmq';
import { logger } from '../../utils/logger';
import { processSubscriptionJob } from './subscription.processor';

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Worker
// concurrency: 2 — low-frequency, sequential-safe jobs
// ─────────────────────────────────────────────────────────────────────────────

export function startSubscriptionWorker(): Worker {
  const worker = new Worker('subscription-queue', processSubscriptionJob, {
    connection: bullmqConnection,
    concurrency: 2,
  });

  worker.on('completed', (job) => {
    logger.info(`Subscription job completed: ${job.name} [${job.id}]`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Subscription job failed: ${job?.name} [${job?.id}]`, {
      error: err.message,
      attempts: job?.attemptsMade,
    });
  });

  worker.on('error', (err) => {
    logger.error(`Subscription worker error: ${err.message}`);
  });

  logger.info('Subscription worker started (concurrency: 2)');
  return worker;
}
