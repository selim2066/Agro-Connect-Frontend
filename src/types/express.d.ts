import type { AppLanguage } from '../middleware/language';

// ─────────────────────────────────────────────────────────────────────────────
// Augment Express Request to include custom properties
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      /** Authenticated user — attached by authenticate middleware */
      user?: {
        id: string;
        email: string;
        role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
      };

      /** Language preference — attached by language middleware */
      lang: AppLanguage;
    }
  }
}

export {};
