import 'dotenv/config'; // must be first — loads .env before env.ts parses
import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';
import { initSocket } from './socket';
import { startAllWorkers } from './queues';
import { logger } from './utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap function — sequential startup with proper error handling
// ─────────────────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  try {
    // 1. Connect to PostgreSQL via Prisma
    await prisma.$connect();
    logger.info('Database connected');

    // 2. Connect to Redis
    await redis.connect();
    // Redis events handle further logging (see lib/redis.ts)

    // 3. Create Express app
    const app = createApp();

    // 4. Create HTTP server (required to share with Socket.io)
    const httpServer = http.createServer(app);

    // 5. Initialize Socket.io (attaches to httpServer)
    initSocket(httpServer);

    // 6. Start BullMQ workers + register cron jobs
    await startAllWorkers();

    // 7. Start listening
    httpServer.listen(env.PORT, () => {
      logger.info(`AgroConnect API running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // ── Graceful shutdown ─────────────────────────────────────────────────

    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received — shutting down gracefully`);

      httpServer.close(async () => {
        await prisma.$disconnect();
        await redis.quit();
        logger.info('Server shut down cleanly');
        process.exit(0);
      });

      // Force exit after 15s if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Graceful shutdown timed out — forcing exit');
        process.exit(1);
      }, 15000);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server:', {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Unhandled rejection / exception safety nets
// ─────────────────────────────────────────────────────────────────────────────

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', { message: err.message, stack: err.stack });
  process.exit(1);
});

void bootstrap();
