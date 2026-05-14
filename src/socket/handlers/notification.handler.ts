import type { Server as SocketServer } from 'socket.io';
import { logger } from '../../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Notification handler
//
// On connect: user joins their personal room `user:{userId}`
// This allows emitToUser(userId, event, data) from anywhere in the app.
//
// Server → Client events:
//   notification:new       — new notification object
//   notification:read      — { notificationId }
//   order:status-updated   — { orderId, status }
//   connection:received    — { from, shopId }
//
// Client → Server events:
//   notification:mark-read — { notificationId }
// ─────────────────────────────────────────────────────────────────────────────

export function registerNotificationHandler(io: SocketServer): void {
  io.on('connection', (socket) => {
    const userId = socket.data.user?.id as string;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    // Join personal room — enables targeted emits
    void socket.join(`user:${userId}`);
    logger.debug(`Socket connected: user:${userId} [${socket.id}]`);

    // Client marks a notification as read
    socket.on('notification:mark-read', ({ notificationId }: { notificationId: string }) => {
      // TODO: call notification service to update DB
      logger.debug(`Notification marked read: ${notificationId} by user:${userId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`Socket disconnected: user:${userId} — ${reason}`);
    });
  });
}
