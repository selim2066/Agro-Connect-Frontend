import type { ServerOptions } from 'socket.io';
import { env } from './env';

// ─────────────────────────────────────────────────────────────────────────────
// Socket.io server configuration
// ─────────────────────────────────────────────────────────────────────────────

export const socketOptions: Partial<ServerOptions> = {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,  // 60s before considering connection dead
  pingInterval: 25000, // send ping every 25s
  connectTimeout: 10000,
};
