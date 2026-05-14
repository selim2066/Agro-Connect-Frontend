import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../errors/errorCodes';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      throw new AppError('Authentication required', 401, ErrorCode.AUTH_REQUIRED);
    }

    // Attach user to request for downstream use
    req.user = {
      id: session.user.id,
      role: session.user.role as 'CUSTOMER' | 'SELLER' | 'ADMIN',
      email: session.user.email,
    };

    next();
  } catch (err) {
    next(err);
  }
}
