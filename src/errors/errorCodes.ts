// ─────────────────────────────────────────────────────────────────────────────
// Error codes — single source of truth (api-conventions.md)
// Use these constants everywhere instead of raw strings.
// ─────────────────────────────────────────────────────────────────────────────

export const ErrorCode = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  NOT_VERIFIED: 'NOT_VERIFIED',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  ALREADY_CONNECTED: 'ALREADY_CONNECTED',
  PLAN_LIMIT_REACHED: 'PLAN_LIMIT_REACHED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
