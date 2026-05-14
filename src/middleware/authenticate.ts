import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../errors/errorCodes';

// ─────────────────────────────────────────────────────────────────────────────
// authenticate — verifies the better-auth session or Bearer token
// Attaches req.user for downstream middleware and controllers.
//
// Actual better-auth session lookup will be wired here once better-auth
// is initialized in lib/better-auth.ts.
// ─────────────────────────────────────────────────────────────────────────────

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Extract token from Authorization header or session cookie
    const token =
      req.headers.authorization?.replace('Bearer ', '') ||
      req.cookies?.['agroconnect.session_token'];

    if (!token) {
      throw new AppError('Authentication required', 401, ErrorCode.AUTH_REQUIRED);
    }

    // TODO: replace stub with actual better-auth session validation
    // const session = await auth.api.getSession({ headers: req.headers });
    // if (!session?.user) throw new AppError(...)
    // req.user = session.user;

    next();
  } catch (err) {
    next(err);
  }
}
