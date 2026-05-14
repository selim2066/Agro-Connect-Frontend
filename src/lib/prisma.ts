import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// ─────────────────────────────────────────────────────────────────────────────
// PrismaClient singleton — prevents multiple connections in dev (hot-reload)
//
// Prisma 7: Recommended to use @prisma/adapter-pg for direct connections
// ─────────────────────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  (globalForPrisma.prisma as PrismaClient) ??
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
