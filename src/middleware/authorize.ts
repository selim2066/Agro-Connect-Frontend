import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../errors/errorCodes';

// ─────────────────────────────────────────────────────────────────────────────
// authorize — role guard factory (backend-rules.md)
// Usage: router.post('/...', authenticate, authorize('ADMIN'), controller)
// ─────────────────────────────────────────────────────────────────────────────

type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as Role | undefined;

    if (!userRole || !allowedRoles.includes(userRole)) {
      next(new AppError('You do not have permission to perform this action', 403, ErrorCode.FORBIDDEN));
      return;
    }

    next();
  };
}
