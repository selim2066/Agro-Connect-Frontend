import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../errors/errorCodes';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// ─────────────────────────────────────────────────────────────────────────────
// Global error handler — MUST be the last middleware in app.ts
//
// Rules from backend-rules.md:
//  - Never expose stack traces in production
//  - Use centralized error handler (globalErrorHandler middleware)
//  - Custom AppError class with statusCode + errorCode
// ─────────────────────────────────────────────────────────────────────────────

export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isProd = env.NODE_ENV === 'production';

  // ── 1. Operational AppError (expected business errors) ──────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
    return;
  }

  // ── 2. Zod Validation Error ──────────────────────────────────────────────
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errorCode: ErrorCode.VALIDATION_ERROR,
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // ── 3. Prisma Known Request Errors ───────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = Unique constraint failed
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
        errorCode: ErrorCode.VALIDATION_ERROR,
      });
      return;
    }
    // P2025 = Record not found
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Record not found',
        errorCode: ErrorCode.NOT_FOUND,
      });
      return;
    }
  }

  // ── 4. Unknown / Unhandled Errors (crash-level) ──────────────────────────
  logger.error('Unhandled error:', {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    message: isProd ? 'Something went wrong' : (err instanceof Error ? err.message : 'Unknown error'),
    errorCode: ErrorCode.INTERNAL_ERROR,
    // Never expose stack in production
    ...(isProd ? {} : { stack: err instanceof Error ? err.stack : undefined }),
  });
}
