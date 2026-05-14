import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// ─────────────────────────────────────────────────────────────────────────────
// PrismaClient singleton — prevents multiple connections in dev (hot-reload)
//
// Prisma 7: DATABASE_URL is passed directly to the constructor
// ─────────────────────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  (globalForPrisma.prisma as PrismaClient) ??
  new PrismaClient({
    datasourceUrl: env.DATABASE_URL as string,
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  } as any);

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
