// ─────────────────────────────────────────────────────────────────────────────
// Pagination helper — used inside services to calculate meta + Prisma skip
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  meta: (total: number) => {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function paginate({ page, limit }: PaginationOptions): PaginationResult {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100); // cap at 100 per page
  const skip = (safePage - 1) * safeLimit;

  return {
    skip,
    take: safeLimit,
    meta: (total: number) => ({
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    }),
  };
}
