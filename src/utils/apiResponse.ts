import type { Response } from 'express';

// ─────────────────────────────────────────────────────────────────────────────
// Standard API response helpers — enforces api-conventions.md format
// ─────────────────────────────────────────────────────────────────────────────

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  statusCode = 200,
): void {
  res.status(statusCode).json({ success: true, message, data });
}

export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T[],
  meta: PaginationMeta,
): void {
  res.status(200).json({ success: true, message, data, meta });
}
