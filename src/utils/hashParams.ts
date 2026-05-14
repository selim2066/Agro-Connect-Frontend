import { createHash } from 'crypto';
import type { ParsedQs } from 'qs';

// ─────────────────────────────────────────────────────────────────────────────
// Hashes a query-param object into a short, stable string for cache keys.
// Format per backend-rules.md: module:identifier:params_hash
// ─────────────────────────────────────────────────────────────────────────────

export function hashParams(params: Record<string, unknown> | ParsedQs): string {
  const normalized = JSON.stringify(params, Object.keys(params).sort());
  return createHash('md5').update(normalized).digest('hex').slice(0, 12);
}
