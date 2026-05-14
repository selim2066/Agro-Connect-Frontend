import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env } from '../config/env';
import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────────────────────────
// Better Auth Instance
//
// provider: postgresql
// plugins: emailAndPassword (standard signup/login)
// custom: role field (defaults to CUSTOMER)
// ─────────────────────────────────────────────────────────────────────────────

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  // Standard email/password flow
  emailAndPassword: {
    enabled: true,
  },

  // Security & Session
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // User schema extensions
  user: {
    additionalFields: {
      role: {
        type: 'string', // Prisma handles the enum mapping
        defaultValue: 'CUSTOMER',
        input: false, // Security: prevent role hijacking on signup
      },
    },
  },

  // Advanced options
  advanced: {
    generateId: false, // use Prisma/DB defaults
  },

  // Email verification (can be enabled later when SMTP is ready)
  /*
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // TODO: integrate with email queue
    }
  }
  */
});
