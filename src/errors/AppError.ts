import type { ErrorCodeType } from './errorCodes';

// ─────────────────────────────────────────────────────────────────────────────
// AppError — custom error class (backend-rules.md)
//
// isOperational = true  → expected business error (return to client)
// isOperational = false → unexpected crash (log + return 500)
// ─────────────────────────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCodeType;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCodeType,
    isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    // Maintain proper stack trace (V8 only)
    Error.captureStackTrace(this, this.constructor);
  }
}
