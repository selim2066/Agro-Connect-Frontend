import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { language } from './middleware/language';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { apiRouter } from './routes';

// ─────────────────────────────────────────────────────────────────────────────
// Express app factory
// Separated from server.ts so it can be imported in tests without
// starting the HTTP server or Socket.io.
// ─────────────────────────────────────────────────────────────────────────────

export function createApp(): express.Application {
  const app = express();

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // ── Request logging (HTTP level) ──────────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // ── Language header parsing — runs before any route handler ───────────────
  app.use(language);

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'AgroConnect API is running' });
  });

  // ── API routes ────────────────────────────────────────────────────────────
  app.use('/api/v1', apiRouter);

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      errorCode: 'NOT_FOUND',
    });
  });

  // ── Global error handler — MUST be last ───────────────────────────────────
  app.use(globalErrorHandler);

  return app;
}
