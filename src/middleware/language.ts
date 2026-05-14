import type { Request, Response, NextFunction } from 'express';

// ─────────────────────────────────────────────────────────────────────────────
// language — parses Accept-Language header into req.lang
// Runs early in the middleware chain so AI routes always have lang context.
// Per backend-rules.md: "Always include language context in system prompt"
// Per api-conventions.md: Accept-Language: en | bn  (default: en)
// ─────────────────────────────────────────────────────────────────────────────

export type AppLanguage = 'en' | 'bn';

export function language(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers['accept-language'] ?? 'en';
  req.lang = header.startsWith('bn') ? 'bn' : 'en';
  next();
}
