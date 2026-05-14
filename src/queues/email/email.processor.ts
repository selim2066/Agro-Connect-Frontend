import type { Job } from 'bullmq';
import { logger } from '../../utils/logger';
import type { EmailJobData, EmailJobName } from './email.queue';

// ─────────────────────────────────────────────────────────────────────────────
// Email Processor — routes each job type to its handler
// Per backend-rules.md: "Always handle job failure gracefully"
// ─────────────────────────────────────────────────────────────────────────────

export async function processEmailJob(job: Job<EmailJobData, void, EmailJobName>): Promise<void> {
  logger.info(`Processing email job: ${job.name} [${job.id}]`);

  switch (job.name) {
    case 'order-confirmation':
      await handleOrderConfirmation(job);
      break;
    case 'order-status-update':
      await handleOrderStatusUpdate(job);
      break;
    case 'connection-alert':
      await handleConnectionAlert(job);
      break;
    case 'subscription-reminder':
      await handleSubscriptionReminder(job);
      break;
    case 'newsletter-broadcast':
      await handleNewsletterBroadcast(job);
      break;
    default:
      logger.warn(`Unknown email job type: ${job.name}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual handlers — each will import nodemailer/email template logic
// ─────────────────────────────────────────────────────────────────────────────

async function handleOrderConfirmation(job: Job): Promise<void> {
  // TODO: send order confirmation email via nodemailer
  logger.debug(`Sending order confirmation for orderId: ${job.data.orderId}`);
}

async function handleOrderStatusUpdate(job: Job): Promise<void> {
  // TODO: send order status update email
  logger.debug(`Sending order status update for orderId: ${job.data.orderId}`);
}

async function handleConnectionAlert(job: Job): Promise<void> {
  // TODO: send connection alert to seller
  logger.debug(`Sending connection alert for shopId: ${job.data.shopId}`);
}

async function handleSubscriptionReminder(job: Job): Promise<void> {
  // TODO: send subscription expiry reminder email
  logger.debug(`Sending subscription reminder for sellerId: ${job.data.sellerId}`);
}

async function handleNewsletterBroadcast(job: Job): Promise<void> {
  // TODO: send newsletter to recipientList (batch with delay)
  logger.debug(`Sending newsletter broadcast: ${job.data.subject}`);
}
