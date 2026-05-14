import { Queue } from 'bullmq';
import { bullmqConnection, defaultJobOptions } from '../../config/bullmq';

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Queue
// Handles: expiry checks (cron), auto-renewal, plan downgrade to FREE
// Low frequency, low concurrency (2)
// ─────────────────────────────────────────────────────────────────────────────

export const subscriptionQueue = new Queue('subscription-queue', {
  connection: bullmqConnection,
  defaultJobOptions,
});

export type SubscriptionJobName =
  | 'check-expiry'
  | 'auto-renew'
  | 'downgrade-to-free';

export interface CheckExpiryData {
  _trigger: 'cron';
}

export interface AutoRenewData {
  subscriptionId: string;
  sellerId: string;
}

export interface DowngradeToFreeData {
  sellerId: string;
}

export type SubscriptionJobData =
  | CheckExpiryData
  | AutoRenewData
  | DowngradeToFreeData;

// ─────────────────────────────────────────────────────────────────────────────
// Job dispatch helpers
// ─────────────────────────────────────────────────────────────────────────────

export const SubscriptionJobs = {
  scheduleExpiryCheck: () =>
    subscriptionQueue.add(
      'check-expiry',
      { _trigger: 'cron' },
      {
        repeat: { pattern: '0 0 * * *' }, // daily at midnight
        jobId: 'daily-expiry-check',       // prevent duplicates
      },
    ),

  scheduleAutoRenew: (data: AutoRenewData) =>
    subscriptionQueue.add('auto-renew', data),

  scheduleDowngrade: (data: DowngradeToFreeData) =>
    subscriptionQueue.add('downgrade-to-free', data),
};
