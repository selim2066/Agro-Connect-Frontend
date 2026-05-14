import { hashParams } from './hashParams';
import type { ParsedQs } from 'qs';

// ─────────────────────────────────────────────────────────────────────────────
// Cache key factory functions
// Format: module:identifier:params_hash  (per backend-rules.md)
// ─────────────────────────────────────────────────────────────────────────────

export const CacheKeys = {
  // Feed keys (hashed filter+pagination combos)
  productFeed: (filters: Record<string, unknown> | ParsedQs) =>
    `product:feed:${hashParams(filters)}`,

  shopFeed: (filters: Record<string, unknown> | ParsedQs) =>
    `shop:feed:${hashParams(filters)}`,

  // Single entity keys
  productSingle: (productId: string) => `product:single:${productId}`,
  shopSingle: (shopId: string) => `shop:single:${shopId}`,

  // Lookup keys
  categoryAll: () => `category:all`,

  // AI recommendation key
  aiRecommendation: (userId: string, input: Record<string, unknown>) =>
    `ai:recommendation:${userId}:${hashParams(input)}`,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Invalidation patterns (used with Redis KEYS or SCAN for wildcard deletes)
// ─────────────────────────────────────────────────────────────────────────────

export const CachePatterns = {
  productFeedAll: 'product:feed:*',
  shopFeedAll: 'shop:feed:*',
  productSingle: (productId: string) => `product:single:${productId}`,
  shopSingle: (shopId: string) => `shop:single:${shopId}`,
  categoryAll: 'category:all',
} as const;
