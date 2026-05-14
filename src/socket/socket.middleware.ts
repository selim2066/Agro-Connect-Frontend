import type { Socket, Server as SocketServer } from 'socket.io';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../errors/errorCodes';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Socket auth middleware
// Validates the token from socket.handshake.auth.token
// Attaches socket.data.user = { id, role } for use in handlers
// ─────────────────────────────────────────────────────────────────────────────

export function registerSocketMiddleware(io: SocketServer): void {
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        throw new AppError('Socket authentication required', 401, ErrorCode.AUTH_REQUIRED);
      }

      // TODO: validate token via better-auth session lookup
      // const session = await auth.api.getSession(...)
      // socket.data.user = { id: session.user.id, role: session.user.role };

      // Stub — wire up better-auth when auth module is implemented
      socket.data.user = { id: 'stub', role: 'CUSTOMER' };

      next();
    } catch (err) {
      logger.warn(`Socket auth failed: ${err instanceof Error ? err.message : String(err)}`);
      next(new Error('Authentication failed'));
    }
  });
}
