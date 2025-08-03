import { PrismaClient } from '@prisma/client';

// Ensure DATABASE_URL is present early (build/runtime).
if (!process.env.DATABASE_URL) {
  throw new Error(
    'Missing DATABASE_URL environment variable. Amplify should inject this via its Environment Variables. ' +
      'Check that the variable name is exactly "DATABASE_URL" (no quotes) in the Amplify Console.'
  );
}

// Avoid multiple instances in dev (Next.js hot reloads)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// You can optionally pass the URL explicitly to be 100% sure what's used.
const prismaClient = globalThis.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['warn', 'error'], // adjust verbosity if needed
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;
