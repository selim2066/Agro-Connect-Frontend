import { Queue } from 'bullmq';
import { bullmqConnection, defaultJobOptions } from '../../config/bullmq';

// ─────────────────────────────────────────────────────────────────────────────
// Email Queue
// Handles: order confirmation, status updates, connection alerts,
//          subscription reminders, newsletter broadcasts
//
// Per backend-rules.md: controllers add jobs and immediately return —
// never await job completion in request handlers.
// ─────────────────────────────────────────────────────────────────────────────

export const emailQueue = new Queue('email-queue', {
  connection: bullmqConnection,
  defaultJobOptions,
});

// ─────────────────────────────────────────────────────────────────────────────
// Job type definitions
// ─────────────────────────────────────────────────────────────────────────────

export type EmailJobName =
  | 'order-confirmation'
  | 'order-status-update'
  | 'connection-alert'
  | 'subscription-reminder'
  | 'newsletter-broadcast';

export interface OrderConfirmationData {
  orderId: string;
  userEmail: string;
  lang: 'en' | 'bn';
}

export interface OrderStatusUpdateData {
  orderId: string;
  status: string;
  userEmail: string;
  lang: 'en' | 'bn';
}

export interface ConnectionAlertData {
  shopId: string;
  buyerName: string;
  sellerEmail: string;
  lang: 'en' | 'bn';
}

export interface SubscriptionReminderData {
  sellerId: string;
  sellerEmail: string;
  planName: string;
  expiresAt: string; // ISO date string
}

export interface NewsletterBroadcastData {
  subject: string;
  html: string;
  recipientList: string[];
}

export type EmailJobData =
  | OrderConfirmationData
  | OrderStatusUpdateData
  | ConnectionAlertData
  | SubscriptionReminderData
  | NewsletterBroadcastData;

// ─────────────────────────────────────────────────────────────────────────────
// Job dispatch helpers — used by services
// ─────────────────────────────────────────────────────────────────────────────

export const EmailJobs = {
  sendOrderConfirmation: (data: OrderConfirmationData) =>
    emailQueue.add('order-confirmation', data),

  sendOrderStatusUpdate: (data: OrderStatusUpdateData) =>
    emailQueue.add('order-status-update', data),

  sendConnectionAlert: (data: ConnectionAlertData) =>
    emailQueue.add('connection-alert', data),

  sendSubscriptionReminder: (data: SubscriptionReminderData) =>
    emailQueue.add('subscription-reminder', data, {
      delay: 0,
    }),

  sendNewsletterBroadcast: (data: NewsletterBroadcastData) =>
    emailQueue.add('newsletter-broadcast', data, {
      attempts: 5, // extra retries for broadcast jobs
    }),
};
