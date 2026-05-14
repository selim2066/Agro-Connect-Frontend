import type { Job } from 'bullmq';
import { logger } from '../../utils/logger';
import type { SubscriptionJobData, SubscriptionJobName } from './subscription.queue';

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Processor
// ─────────────────────────────────────────────────────────────────────────────

export async function processSubscriptionJob(
  job: Job<SubscriptionJobData, void, SubscriptionJobName>,
): Promise<void> {
  logger.info(`Processing subscription job: ${job.name} [${job.id}]`);

  switch (job.name) {
    case 'check-expiry':
      await handleCheckExpiry();
      break;
    case 'auto-renew':
      await handleAutoRenew(job);
      break;
    case 'downgrade-to-free':
      await handleDowngrade(job);
      break;
    default:
      logger.warn(`Unknown subscription job type: ${job.name}`);
  }
}

async function handleCheckExpiry(): Promise<void> {
  // TODO: query all ACTIVE subscriptions where expiresAt <= now
  // For each expired one: dispatch auto-renew or downgrade-to-free job
  logger.debug('Running daily subscription expiry check');
}

async function handleAutoRenew(job: Job): Promise<void> {
  // TODO: attempt renewal via SSLCommerz recurring charge
  // On failure: dispatch downgrade-to-free
  logger.debug(`Auto-renewing subscription: ${job.data.subscriptionId}`);
}

async function handleDowngrade(job: Job): Promise<void> {
  // TODO: set seller plan to FREE, update subscription status to EXPIRED
  // Dispatch subscription-reminder email job
  logger.debug(`Downgrading seller to FREE plan: ${job.data.sellerId}`);
}
