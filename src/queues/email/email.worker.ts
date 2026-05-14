import { Worker } from 'bullmq';
import { bullmqConnection } from '../../config/bullmq';
import { logger } from '../../utils/logger';
import { processEmailJob } from './email.processor';

// ─────────────────────────────────────────────────────────────────────────────
// Email Worker
// concurrency: 5 — can process 5 email jobs in parallel
// Per backend-rules.md: "Log failed jobs with Winston"
// ─────────────────────────────────────────────────────────────────────────────

export function startEmailWorker(): Worker {
  const worker = new Worker('email-queue', processEmailJob, {
    connection: bullmqConnection,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.info(`Email job completed: ${job.name} [${job.id}]`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Email job failed: ${job?.name} [${job?.id}]`, {
      error: err.message,
      attempts: job?.attemptsMade,
    });
  });

  worker.on('error', (err) => {
    logger.error(`Email worker error: ${err.message}`);
  });

  logger.info('Email worker started (concurrency: 5)');
  return worker;
}
