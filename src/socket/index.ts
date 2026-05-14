import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { socketOptions } from '../config/socket';
import { registerSocketMiddleware } from './socket.middleware';
import { registerNotificationHandler } from './handlers/notification.handler';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Socket.io server factory
// Called from server.ts — receives the raw http.Server instance
// ─────────────────────────────────────────────────────────────────────────────

let _io: SocketServer | null = null;

export function initSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, socketOptions);

  // Register auth middleware
  registerSocketMiddleware(io);

  // Register event handlers
  registerNotificationHandler(io);

  _io = io;
  logger.info('Socket.io server initialized');
  return io;
}

// ─────────────────────────────────────────────────────────────────────────────
// emitToUser — used by services to push real-time events
// Services import this helper, never the `io` instance directly.
//
// Usage: emitToUser(userId, 'notification:new', { ... })
// ─────────────────────────────────────────────────────────────────────────────

export function emitToUser(userId: string, event: string, data: unknown): void {
  if (!_io) {
    logger.warn(`emitToUser called before Socket.io was initialized`);
    return;
  }
  _io.to(`user:${userId}`).emit(event, data);
}
