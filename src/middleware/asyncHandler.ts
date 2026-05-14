import type { Request, Response, NextFunction } from 'express';

// ─────────────────────────────────────────────────────────────────────────────
// asyncHandler — wraps async route handlers so thrown errors go to next()
// Mandated by backend-rules.md: "Use asyncHandler wrapper for all async controllers"
// ─────────────────────────────────────────────────────────────────────────────

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
