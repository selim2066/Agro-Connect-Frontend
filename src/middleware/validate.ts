import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../errors/errorCodes';

// ─────────────────────────────────────────────────────────────────────────────
// validate — Zod schema validation factory
// Validates before reaching the controller (backend-rules.md)
// Strips unknown fields automatically via Zod's strict/strip behavior.
//
// Usage: router.post('/', validate(createProductSchema), controller)
//        router.get('/', validate(querySchema, 'query'), controller)
// ─────────────────────────────────────────────────────────────────────────────

type Target = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(new AppError('Validation failed', 400, ErrorCode.VALIDATION_ERROR));
      return;
    }

    // Replace with parsed (stripped + coerced) data
    req[target] = result.data;
    next();
  };
}
