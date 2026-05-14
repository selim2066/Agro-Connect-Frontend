import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// ─────────────────────────────────────────────────────────────────────────────
// Default rate limiter — applied to all public routes
// Per backend-rules.md: "Rate limit all public routes"
// ─────────────────────────────────────────────────────────────────────────────

export const defaultRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,   // 15 minutes default
  max: env.RATE_LIMIT_MAX,              // 100 requests default
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Strict limiter — for auth endpoints (login, register)
// ─────────────────────────────────────────────────────────────────────────────

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// AI limiter — IP-level guard (per-user-per-day limit is enforced in service)
// Per backend-rules.md: "Extra rate limit on AI routes per user per day"
// ─────────────────────────────────────────────────────────────────────────────

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI rate limit reached, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});
